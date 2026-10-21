import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { EmployeeAgendaEventCard } from '@/features/employeeWorkspace/components/EmployeeAgendaEventCard';
import { employeeEventFixture } from '@/shared/test/apiFixtures';

test('apasarea Maps in Agenda nu deschide detaliile evenimentului', async () => {
  const onDetails = jest.fn();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const { renderer, unmount } = await renderWithProviders(<EmployeeAgendaEventCard onDetails={onDetails} event={{ ...employeeEventFixture, contact_phone: null, map_location: { kind: 'manual_pin', place_id: null, latitude: 47.0465, longitude: 21.9189, confirmed: true, confirmed_at: '2026-10-08T15:00:00Z' } }} />);
  await ReactTestRenderer.act(async () => { await renderer.root.findByProps({ accessibilityLabel: 'Deschide Google Maps' }).props.onPress(); });
  expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('query=47.0465'));
  expect(onDetails).not.toHaveBeenCalled();
  await unmount();
});

test('ascunde Maps daca pinul necesita reconfirmare', async () => {
  const { renderer, unmount } = await renderWithProviders(<EmployeeAgendaEventCard onDetails={jest.fn()} event={{ ...employeeEventFixture, map_location: { kind: 'manual_pin', place_id: null, latitude: 47, longitude: 22, confirmed: false, confirmed_at: null } }} />);
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Deschide Google Maps' })).toHaveLength(0);
  await unmount();
});
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      jsonResponse(200, {
        id: 'user-1',
        name: 'Animator',
        email: 'animator@example.com',
        role: 'employee',
        employee_id: 'employee-1',
      }),
    ),
  ) as unknown as typeof globalThis.fetch;
});

test.each([550.25, 0])(
  'afișează câștigul și soldul de încasat de %s lei separat',
  async amountToCollect => {
    const { renderer, unmount } = await renderWithProviders(
      <EmployeeAgendaEventCard
        event={{ ...employeeEventFixture, amount_to_collect: amountToCollect }}
        onDetails={jest.fn()}
      />,
    );

    expect(
      renderer.root.findByProps({ label: 'Câștig: 100 lei' }),
    ).toBeDefined();
    expect(
      renderer.root.findByProps({
        label: `De încasat: ${amountToCollect === 0 ? '0' : '550,25'} lei`,
      }),
    ).toBeDefined();

    await unmount();
  },
);

test('ascunde încasarea când backendul întoarce null și păstrează câștigul', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeAgendaEventCard
      event={employeeEventFixture}
      onDetails={jest.fn()}
    />,
  );

  expect(renderer.root.findByProps({ label: 'Câștig: 100 lei' })).toBeDefined();
  expect(JSON.stringify(renderer.toJSON())).not.toContain('De încasat:');

  await unmount();
});
