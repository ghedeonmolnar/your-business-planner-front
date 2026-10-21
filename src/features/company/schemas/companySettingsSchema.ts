import { z } from 'zod';

export const companySettingsSchema = z.object({
  name: z.string().trim().min(1, 'Completează numele companiei.').max(255),
  email: z.union([
    z.literal(''),
    z.string().email('Completează un email valid.'),
  ]),
  phone: z.string().max(50),
  address: z.string().max(255),
});
export type CompanySettingsValues = z.infer<typeof companySettingsSchema>;
