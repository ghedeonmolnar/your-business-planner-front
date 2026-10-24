import { z } from 'zod';
import { isValidIsoDate } from '@/shared/utils/dateInput';

export const customerSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const customerListItemSchema = customerSchema.extend({
  bookings_count: z.number().int().nonnegative(),
});

export const customerDateRangeSchema = z
  .object({
    date_from: z
      .string()
      .refine(isValidIsoDate, 'Alege o dată de început validă.'),
    date_to: z
      .string()
      .refine(isValidIsoDate, 'Alege o dată de sfârșit validă.'),
  })
  .refine(values => values.date_to >= values.date_from, {
    path: ['date_to'],
    message:
      'Data de sfârșit trebuie să fie după data de început sau în aceeași zi.',
  });

export type CustomerDateRange = z.infer<typeof customerDateRangeSchema>;
