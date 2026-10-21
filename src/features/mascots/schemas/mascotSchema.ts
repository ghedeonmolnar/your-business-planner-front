import { z } from 'zod';
import {
  MAX_RATE_AMOUNT,
  moneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';

export const mascotImageSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
});

export const mascotSchema = z.object({
  name: z.string().trim().min(1, 'Completează numele mascotei.'),
  price_per_hour: moneyFieldSchema({
    formatMessage: 'Prețul poate avea cel mult două zecimale.',
    maximum: MAX_RATE_AMOUNT,
    maximumMessage: 'Prețul este prea mare.',
    minimum: 0,
    minimumMessage: 'Prețul nu poate fi negativ.',
  }),
  image: mascotImageSchema.nullable(),
  is_active: z.boolean(),
});

export type MascotFormInput = z.input<typeof mascotSchema>;
export type MascotFormValues = z.output<typeof mascotSchema>;

export const emptyMascotForm: MascotFormInput = {
  name: '',
  price_per_hour: 0,
  image: null,
  is_active: true,
};
