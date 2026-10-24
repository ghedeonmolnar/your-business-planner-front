import { z } from 'zod';

const optionalDate = z.union([
  z.literal(''),
  z.iso.date('Alege o dată validă.'),
]);

export const bookingFilterSchema = z
  .object({
    date_from: optionalDate,
    date_to: optionalDate,
    type: z.string().max(255),
    payment_status: z.enum(['', 'unpaid', 'partial', 'paid']),
  })
  .refine(
    values =>
      !values.date_from ||
      !values.date_to ||
      values.date_to >= values.date_from,
    {
      message: 'Data de sfârșit trebuie să fie după data de început.',
      path: ['date_to'],
    },
  );

export type BookingAdvancedFilterValues = z.infer<typeof bookingFilterSchema>;
export const EMPTY_BOOKING_ADVANCED_FILTERS: BookingAdvancedFilterValues = {
  date_from: '',
  date_to: '',
  type: '',
  payment_status: '',
};
