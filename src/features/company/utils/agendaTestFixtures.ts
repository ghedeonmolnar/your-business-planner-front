import {
  AgendaItem,
  AgendaSummaryData,
} from '@/features/company/schemas/agendaSchemas';

export const agendaSummaryFixture: AgendaSummaryData = {
  date: '2026-10-29',
  month: '2026-10',
  events_count: 12,
  remaining_count: 3,
  attention_count: 4,
  overdue_advances_count: 2,
  overdue_payments_count: 0,
  menus_due_count: 2,
  received_amount: '42500.50',
  due_amount: '7500.25',
  due_count: 3,
  due_from: '2026-10-29',
  due_to: '2026-11-04',
  weekend_date: '2026-10-31',
};

export const agendaItemFixture: AgendaItem = {
  id: 'advance-1',
  event_id: 'event-1',
  kind: 'advance',
  client_name: 'Maria Popescu',
  hall_name: 'Sala Magnolia',
  event_date: '2026-12-05',
  event_status: 'tentative',
  due_at: '2026-10-28',
  amount: '1500.25',
  method: null,
  category: 'advance',
};
