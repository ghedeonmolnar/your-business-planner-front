import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const amount = z.string().regex(/^\d+\.\d{2}$/);
const count = z.number().int().nonnegative();

export const agendaViewSchema = z.enum([
  'events',
  'attention',
  'received',
  'due',
]);

export const agendaSummarySchema = z.object({
  date,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  events_count: count,
  remaining_count: count,
  attention_count: count,
  overdue_advances_count: count,
  overdue_payments_count: count,
  menus_due_count: count,
  received_amount: amount.nullable(),
  due_amount: amount.nullable(),
  due_count: count.nullable(),
  due_from: date,
  due_to: date,
  weekend_date: date,
});

export const agendaItemSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  kind: z.enum(['event', 'menus', 'advance', 'planned', 'receipt']),
  client_name: z.string().nullable(),
  hall_name: z.string().nullable(),
  event_date: date,
  event_status: z.enum([
    'tentative',
    'confirmed',
    'completed',
    'cancelled',
    'expired',
  ]),
  due_at: date,
  amount: amount.nullable(),
  method: z.enum(['cash', 'card', 'transfer']).nullable(),
  category: z.string().nullable(),
});

export type AgendaView = z.infer<typeof agendaViewSchema>;
export type AgendaSummaryData = z.infer<typeof agendaSummarySchema>;
export type AgendaItem = z.infer<typeof agendaItemSchema>;
