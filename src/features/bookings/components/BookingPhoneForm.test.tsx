import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingPhoneForm } from '@/features/bookings/components/BookingPhoneForm';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('cere telefon valid și îl salvează fără a rescrie notele clientului sau a trimite de două ori', async () => {
  const client = {
    id: 'client-1',
    version: 1,
    name: 'Client test',
    phone: null,
    notes: 'Notă privată păstrată',
  };
  globalThis.fetch = jest.fn((url, init) =>
    Promise.resolve(
      jsonResponse(
        200,
        String(url).endsWith('/me')
          ? plannerAccount
          : {
              ...client,
              ...JSON.parse(String(init?.body)),
              phone: '+40712345678',
            },
      ),
    ),
  ) as typeof globalThis.fetch;
  const onSaved = jest.fn();
  const onClose = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingPhoneForm client={client} onSaved={onSaved} onClose={onClose} />,
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Salvează telefonul' })
      .props.onPress();
  });
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'PUT'),
  ).toBe(false);
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Completează un număr de telefon valid.',
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Telefonul clientului' })
      .props.onChangeText('0712345678');
  });
  await ReactTestRenderer.act(async () => {
    const submit = renderer.root.findByProps({
      accessibilityLabel: 'Salvează telefonul',
    }).props.onPress;
    submit();
    submit();
  });
  const writes = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'PUT');
  expect(writes).toHaveLength(1);
  expect(String(writes[0][0])).toContain('/clients/client-1');
  expect(JSON.parse(String(writes[0][1]?.body))).toEqual({
    phone: '0712345678',
    version: 1,
  });
  expect(onSaved).toHaveBeenCalledWith(
    expect.objectContaining({ phone: '+40712345678', notes: client.notes }),
  );
  expect(onClose).toHaveBeenCalledTimes(1);
  await unmount();
});
