import {
  companyProfileDefaults,
  companyProfilePayload,
} from '@/features/company/utils/companyProfileForm';
import { companySettingsSchema } from '@/features/company/schemas/companySettingsSchema';

const company = {
  id: 'company-1',
  name: 'Nume comercial',
  email: null,
  phone: null,
  address: null,
};

test('profilul fiscal salvat precompletează formularul de facturare', () => {
  const billing = {
    fiscal_code: '12345678',
    legal_name: 'Firma SRL',
    address: 'Adresa fiscală',
    country: 'RO' as const,
    vat_registered: true,
    iban: null,
    bank_name: null,
    trade_register_number: null,
    city: null,
    county: null,
    postal_code: null,
  };
  const defaults = companyProfileDefaults({
    ...company,
    billing_profile: billing,
  });
  expect(defaults.legal_name).toBe('Firma SRL');
  expect(defaults.name).toBe('Nume comercial');
  expect(companyProfilePayload(defaults).billing_profile).toEqual(billing);
});

test('permite profil fără date fiscale și respinge facturarea incompletă', () => {
  const defaults = companyProfileDefaults(company);
  expect(companySettingsSchema.safeParse(defaults).success).toBe(true);
  expect(companyProfilePayload(defaults).billing_profile).toBeNull();
  expect(
    companySettingsSchema.safeParse({ ...defaults, fiscal_code: '12345678' })
      .success,
  ).toBe(false);
  expect(
    companySettingsSchema.safeParse({ ...defaults, bank_name: 'Bancă' })
      .success,
  ).toBe(false);
});
