import { z } from 'zod';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';
import {
  MAX_BOOKING_AMOUNT,
  MAX_PAYMENT_NOTES_LENGTH,
} from '@/features/bookings/utils/bookingFormLimits';

export const bookingPaymentSchema = z
  .object({
    type: z.enum(['incoming', 'outgoing']),
    category: z.string().min(1, 'Alege categoria.'),
    amount: z
      .string()
      .regex(/^\d+([.,]\d{1,2})?$/, 'Introdu o sumă validă.')
      .refine(
        value =>
          Number(value.replace(',', '.')) > 0 &&
          Number(value.replace(',', '.')) <= MAX_BOOKING_AMOUNT,
        'Suma trebuie să fie pozitivă și să nu depășească 99.999.999,99 lei.',
      ),
    paid_at: z.iso.date('Alege o dată validă.'),
    method: z.enum(['cash', 'card', 'transfer']),
    status: z.enum(['pending', 'completed', 'cancelled']),
    notes: z
      .string()
      .max(MAX_PAYMENT_NOTES_LENGTH, 'Folosește cel mult 5.000 de caractere.'),
  })
  .superRefine((value, context) => {
    if (
      !bookingPaymentCategories[value.type].some(
        category => category.id === value.category,
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['category'],
        message: 'Alege o categorie pentru operațiunea selectată.',
      });
    }
  });
export type BookingPaymentValues = z.infer<typeof bookingPaymentSchema>;
