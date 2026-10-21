import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { EmployeeEventCard } from '@/features/employeeWorkspace/components/EmployeeEventCard';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';

const event: EmployeeEvent = {
  id: 'event-1',
  date: '2026-09-20',
  start_time: '10:00',
  end_time: '11:00',
  duration_minutes: 60,
  location: 'Oradea',
  address: 'Strada Test 1',
  type: 'aniversare',
  type_label: 'Aniversare',
  status: 'completed',
  status_label: 'Finalizat',
  client_name: 'Client Test',
  contact_phone: '0712345678',
  mascot: { id: 'mascot-1', name: 'Minnie' },
  coworkers: [],
  earnings: 100,
  projected_earnings: null,
  amount_to_collect: null,
};

test('shows only personal earnings and opens client contact from the card', async () => {
  const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const onDetails = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EmployeeEventCard event={event} onDetails={onDetails} />);
  });

  expect(renderer?.root.findByProps({ label: 'Câștig: 100 lei' })).toBeDefined();
  expect(renderer?.root.findByProps({ label: 'Finalizat' })).toBeDefined();
  expect(JSON.stringify(renderer?.toJSON())).toContain('Aniversare');
  expect(JSON.stringify(renderer?.toJSON())).not.toContain('aniversare');
  expect(renderer?.root.findAllByProps({ accessibilityLabel: 'Editează eveniment' })).toHaveLength(0);
  expect(renderer?.root.findAllByProps({ accessibilityLabel: 'Șterge eveniment' })).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.root.findByProps({ accessibilityLabel: 'Detalii eveniment Oradea' }).props.onPress();
    await renderer?.root.findByProps({ accessibilityLabel: 'Sună clientul' }).props.onPress();
    await renderer?.root.findByProps({ accessibilityLabel: 'Deschide WhatsApp' }).props.onPress();
  });

  expect(onDetails).toHaveBeenCalledWith(event);
  expect(openUrl).toHaveBeenCalledWith('tel:+40712345678');
  expect(openUrl).toHaveBeenCalledWith('https://wa.me/40712345678');

  await ReactTestRenderer.act(async () => renderer?.unmount());
  openUrl.mockRestore();
});

test('cancelled events show no earnings or money actions', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EmployeeEventCard event={{ ...event, status: 'cancelled', status_label: 'Anulat', earnings: null, projected_earnings: null }} />);
  });

  expect(renderer?.root.findByProps({ label: 'Anulat' })).toBeDefined();
  expect(renderer?.root.findAllByProps({ label: 'Câștig: 100 lei' })).toHaveLength(0);
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

test('upcoming events show only the personal estimated earnings', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EmployeeEventCard event={{ ...event, status: 'confirmed', status_label: 'Rezervat', earnings: null, projected_earnings: 80 }} />);
  });

  expect(renderer?.root.findByProps({ label: 'Câștig estimat: 80 lei' })).toBeDefined();
  expect(renderer?.root.findAllByProps({ label: 'Câștig: 100 lei' })).toHaveLength(0);
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
