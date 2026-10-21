import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { EventSummaryHeader } from '@/features/events/components/EventSummaryHeader';
import { Event } from '@/features/events/types';

const event: Event = {
  id: 'event-1',
  client_id: 'client-1',
  communication_channel: 'whatsapp',
  contact_value: '0755123456',
  employee_id: 'employee-1',
  mascot_id: 'mascot-1',
  date: dayjs().format('YYYY-MM-DD'),
  start_time: '16:00',
  end_time: '18:00',
  price_per_hour: 250,
  location: 'Oradea',
  address: 'Rasaritului nr20',
  type: 'aniversare',
  assignments: [
    {
      mascot_id: 'mascot-1',
      employee_id: 'employee-1',
      mascot_name: 'Mickey Mouse',
      employee_name: 'Molnar Ghedeon',
    },
    {
      mascot_id: 'mascot-2',
      employee_id: 'employee-2',
      mascot_name: 'Minnie Mouse',
      employee_name: 'Molnar Tabita',
    },
  ],
};

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

test('afișează detaliile evenimentului pe rânduri, fără numărul de telefon', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EventSummaryHeader event={event} />);
  });

  const text = getRenderedText(renderer?.toJSON());

  expect(text).toContain('LocațiaOradea - Rasaritului nr20');
  expect(text).toContain('DataAstăzi de la ora 16:00 până la 18:00');
  expect(text).toContain('PersonajeMickey Mouse, Minnie Mouse');
  expect(text).toContain('AngajațiMolnar Ghedeon, Molnar Tabita');
  expect(text).not.toContain('0755123456');
  expect(text).not.toContain('Contacteaza');

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
