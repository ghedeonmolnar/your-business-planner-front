import { z } from 'zod';

export const companySettingsSchema = z
  .object({
    name: z.string().trim().min(1, 'Completează numele companiei.').max(255),
    email: z.union([
      z.literal(''),
      z.string().email('Completează un email valid.'),
    ]),
    phone: z.string().max(50),
    address: z.string().max(255),
    fiscal_code: z
      .string()
      .trim()
      .regex(
        /^(?:[1-9][0-9]{1,9})?$/,
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
      .trim()
      .regex(
        /^(?:RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16})?$/,
        'Completează un IBAN românesc valid, fără spații.',
      ),
    bank_name: z.string().trim().max(255),
  })
  .superRefine((values, context) => {
    const hasFiscalData = Boolean(
      values.fiscal_code ||
      values.legal_name ||
      values.fiscal_address ||
      values.iban ||
      values.bank_name ||
      values.trade_register_number ||
      values.city ||
      values.county ||
      values.postal_code ||
      values.vat_registered,
    );
    if (!hasFiscalData) {
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
