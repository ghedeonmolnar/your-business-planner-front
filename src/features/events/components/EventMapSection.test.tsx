import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EventMapSection } from '@/features/events/components/EventMapSection';
import { eventFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  getAuthToken: jest.fn(() => Promise.resolve('test-token')),
  clearAuthToken: jest.fn(() => Promise.resolve()),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const event = {
  ...eventFixture,
  map_location: {
    kind: 'manual_pin' as const,
    place_id: null,
    latitude: 47.0465,
    longitude: 21.9189,
    confirmed: true,
    confirmed_at: '2026-10-08T15:00:00Z',
  },
};
let role: 'admin' | 'employee';
beforeEach(() => {
  role = 'admin';
  globalThis.fetch = jest.fn((url, options) =>
    Promise.resolve(
      jsonResponse(
        200,
        options?.method === 'DELETE'
          ? { map_location: null }
          : {
              id: 'user-1',
              name: 'Test',
              email: 'test@example.com',
              role,
              employee_id: role === 'employee' ? 'employee-1' : null,
            },
      ),
    ),
  ) as typeof globalThis.fetch;
});

test('adminul poate deschide selectorul si sterge pinul dupa confirmare', async () => {
  const onEdit = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <EventMapSection event={event} onEdit={onEdit} />,
  );
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 5));
  });
  await ReactTestRenderer.act(async () =>
    renderer.root
      .findByProps({ label: 'Modifică locația pe hartă' })
      .props.onPress(),
  );
  expect(onEdit).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () =>
    renderer.root.findByProps({ label: 'Șterge pinul' }).props.onPress(),
  );
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(([, options]) => options?.method === 'DELETE'),
  ).toHaveLength(0);
  await pressDialogButton(renderer, 'Șterge pinul');
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(([, options]) => options?.method === 'DELETE'),
  ).toHaveLength(1);
  await unmount();
});

test('angajatul vede Maps fara actiuni de modificare a pinului', async () => {
  role = 'employee';
  const { renderer, unmount } = await renderWithProviders(
    <EventMapSection event={event} onEdit={jest.fn()} />,
  );
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 5));
  });
  expect(
    renderer.root.findByProps({ label: 'Deschide Google Maps' }),
  ).toBeDefined();
  expect(
    renderer.root.findAllByProps({ label: 'Modifică locația pe hartă' }),
  ).toHaveLength(0);
  expect(renderer.root.findAllByProps({ label: 'Șterge pinul' })).toHaveLength(
    0,
  );
  await unmount();
});
