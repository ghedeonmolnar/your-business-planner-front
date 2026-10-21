import { z } from 'zod';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';

export const bookingPaymentSchema = z
  .object({
    type: z.enum(['incoming', 'outgoing']),
    category: z.string().min(1, 'Alege categoria.'),
    amount: z
      .string()
      .regex(/^\d+([.,]\d{1,2})?$/, 'Introdu o sumă validă.')
      .refine(
        value => Number(value.replace(',', '.')) > 0,
        'Suma trebuie să fie pozitivă.',
      ),
    paid_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege data.'),
    method: z.enum(['cash', 'card', 'transfer']),
    status: z.enum(['pending', 'completed', 'cancelled']),
    notes: z.string(),
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
