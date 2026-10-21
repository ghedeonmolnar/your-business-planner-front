import { z } from 'zod';
import {
  MAX_TOTAL_AMOUNT,
  moneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';

export const paymentSchema = z.object({
  type: z.enum(['incoming', 'outgoing']),
  category: z
    .string()
    .trim()
    .regex(/^[a-z0-9_-]+$/, 'Folosește litere mici, cifre, - sau _.'),
  amount: moneyFieldSchema({
    formatMessage: 'Suma poate avea cel mult două zecimale.',
    maximum: MAX_TOTAL_AMOUNT,
    maximumMessage: 'Suma este prea mare.',
    minimum: 0,
    minimumExclusive: true,
    minimumMessage: 'Completează o sumă pozitivă.',
  }),
  paid_at: z.string().min(1, 'Alege data.'),
  method: z.string().trim().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  notes: z.string().trim().optional(),
});

export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentFormValues = z.output<typeof paymentSchema>;

export const emptyPaymentForm: PaymentFormInput = {
  type: 'incoming',
  category: 'partial',
  amount: 0,
  paid_at: '',
  method: '',
  status: 'completed',
  notes: '',
};
