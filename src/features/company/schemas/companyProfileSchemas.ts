import { z } from 'zod';

export const fiscalProfileSchema = z.object({
  fiscal_code: z.string(),
  legal_name: z.string(),
  trade_register_number: z.string().nullable().optional(),
  address: z.string(),
  city: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.literal('RO'),
  vat_registered: z.boolean(),
  iban: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
});

export const companyProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  billing_profile: fiscalProfileSchema.nullable().optional(),
});

export type FiscalProfile = z.infer<typeof fiscalProfileSchema>;
export type CompanyProfile = z.infer<typeof companyProfileSchema>;
