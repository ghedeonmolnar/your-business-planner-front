import { z } from 'zod';

export const bookingPaymentApiSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  event_id: z.string(),
  type: z.enum(['incoming', 'outgoing']),
  category: z.string(),
  amount: z.number(),
  paid_at: z.string(),
  method: z.enum(['cash', 'card', 'transfer']).nullable().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  notes: z.string().nullable().optional(),
});
export const bookingDocumentApiSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  event_id: z.string(),
  document_type: z.enum(['contract', 'invoice', 'other']),
  title: z.string(),
  original_name: z.string(),
  mime_type: z.string().nullable().optional(),
  size_bytes: z.number().int().nonnegative(),
  document_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export const bookingDownloadSchema = z.object({
  download_url: z.string().url(),
  expires_in_minutes: z.number().int().positive(),
});

export type BookingPayment = z.infer<typeof bookingPaymentApiSchema>;
