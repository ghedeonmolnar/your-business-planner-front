import { z } from 'zod';

export const subscriptionInvoiceSchema = z.object({
  id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'issued', 'uncertain', 'rejected']),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  currency: z.literal('RON'),
  issued_on: z.iso.date(),
  series: z.string().nullable(),
  number: z.string().nullable(),
});
