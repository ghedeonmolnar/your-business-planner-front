import { z } from 'zod';
import {
  normalizeFiscalCode,
  normalizeIban,
  isValidFiscalCode,
} from '@/features/company/utils/fiscalProfileValues';

const fiscalFields = [
  'fiscal_code',
  'legal_name',
  'fiscal_address',
  'iban',
  'bank_name',
  'trade_register_number',
  'city',
  'county',
  'postal_code',
  'vat_registered',
] as const;
export const hasCompanyFiscalData = (
  values: Record<(typeof fiscalFields)[number], string | boolean>,
) => fiscalFields.some(field => Boolean(values[field]));

export const companySettingsSchema = z
  .object({
    name: z.string().trim().min(1, 'Completează numele companiei.').max(255),
    email: z
      .string()
      .trim()
      .pipe(
        z.union([
          z.literal(''),
          z.string().email('Completează un email valid.').max(255),
        ]),
      ),
    phone: z.string().trim().max(50),
    address: z.string().trim().max(255),
    fiscal_code: z
      .string()
      .transform(normalizeFiscalCode)
      .refine(
        code => code === '' || isValidFiscalCode(code),
        'Completează un CUI valid, doar cu cifre.',
      ),
    legal_name: z.string().trim().max(255),
    trade_register_number: z.string().trim().max(100),
    fiscal_address: z.string().trim().max(1000),
    city: z.string().trim().max(255),
    county: z.string().trim().max(255),
    postal_code: z.string().trim().max(20),
    vat_registered: z.boolean(),
    iban: z
      .string()
      .transform(normalizeIban)
      .pipe(
        z
          .string()
          .regex(
            /^(?:RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16})?$/,
            'Completează un IBAN românesc valid, fără spații.',
          ),
      ),
    bank_name: z.string().trim().max(255),
  })
  .superRefine((values, context) => {
    if (!hasCompanyFiscalData(values)) {
      return;
    }
    for (const [field, message] of [
      ['fiscal_code', 'Completează CUI-ul firmei.'],
      ['legal_name', 'Completează denumirea juridică.'],
      ['fiscal_address', 'Completează adresa fiscală.'],
    ] as const) {
      if (!values[field]) {
        context.addIssue({ code: 'custom', path: [field], message });
      }
    }
  });
export type CompanySettingsValues = z.infer<typeof companySettingsSchema>;
