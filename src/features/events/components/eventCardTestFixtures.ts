import dayjs from 'dayjs';
import { Event } from '@/features/events/types';

export const event: Event = {
  id: 'event-1',
  client_id: 'client-1',
  contact_phone: '+40732652339',
  employee_id: 'employee-1',
  mascot_id: 'mascot-1',
  mascot_ids: ['mascot-1', 'mascot-2'],
  mascots: [
    {
      id: 'mascot-1',
      is_active: true,
      name: 'Mickey Mouse',
      price_per_hour: 100,
      slug: 'mickey-mouse',
    },
    {
      id: 'mascot-2',
      is_active: true,
      name: 'Spider-Man',
      price_per_hour: 100,
      slug: 'spider-man',
    },
  ],
  date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
  start_time: '12:00',
  end_time: '14:00',
  price_per_hour: 200,
  balance_due: 400,
  paid_amount: 100,
  location: 'Oradea',
  type: 'aniversare',
};

export function getRenderedText(value: unknown): string {
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
