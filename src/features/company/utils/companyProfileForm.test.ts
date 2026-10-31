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

test('normalizează CUI și IBAN fără a elimina caractere invalide', () => {
  const values = {
    ...companyProfileDefaults(company),
    fiscal_code: ' RO 12345678 ',
    legal_name: 'Firma SRL',
    fiscal_address: 'Adresa fiscală',
    iban: 'ro49 aaaa 1b31 0075 9384 0000',
  };
  const parsed = companySettingsSchema.parse(values);
  expect(companyProfilePayload(parsed).billing_profile).toMatchObject({
    fiscal_code: '12345678',
    iban: 'RO49AAAA1B31007593840000',
    country: 'RO',
    vat_registered: false,
  });
  expect(
    companySettingsSchema.safeParse({ ...values, fiscal_code: 'RO 12A34' })
      .success,
  ).toBe(false);
  expect(
    companySettingsSchema.safeParse({ ...values, fiscal_code: '012345' })
      .success,
  ).toBe(false);
  expect(
    companySettingsSchema.safeParse({ ...values, iban: 'RO00INVALID' }).success,
  ).toBe(false);
});

test('datele bancare rămân opționale, iar contactul și adresa fiscală sunt independente', () => {
  const values = companySettingsSchema.parse({
    ...companyProfileDefaults(company),
    address: 'Adresă contact',
    fiscal_code: '12345678',
    legal_name: 'Firma SRL',
    fiscal_address: 'Adresă fiscală separată',
  });
  expect(companyProfilePayload(values)).toMatchObject({
    address: 'Adresă contact',
    email: null,
    phone: null,
    billing_profile: {
      address: 'Adresă fiscală separată',
      iban: null,
      bank_name: null,
    },
  });
});
