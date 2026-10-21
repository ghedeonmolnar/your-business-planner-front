import { CompanyProfile } from '@/features/company/schemas/companyProfileSchemas';
import { CompanySettingsValues } from '@/features/company/schemas/companySettingsSchema';

export function companyProfileDefaults(
  company: CompanyProfile,
): CompanySettingsValues {
  const fiscal = company.billing_profile;
  return {
    name: company.name,
    email: company.email ?? '',
    phone: company.phone ?? '',
    address: company.address ?? '',
    fiscal_code: fiscal?.fiscal_code ?? '',
    legal_name: fiscal?.legal_name ?? '',
    trade_register_number: fiscal?.trade_register_number ?? '',
    fiscal_address: fiscal?.address ?? '',
    city: fiscal?.city ?? '',
    county: fiscal?.county ?? '',
    postal_code: fiscal?.postal_code ?? '',
    vat_registered: fiscal?.vat_registered ?? false,
    iban: fiscal?.iban ?? '',
    bank_name: fiscal?.bank_name ?? '',
  };
}

export function companyProfilePayload(values: CompanySettingsValues) {
  return {
    name: values.name,
    email: values.email || null,
    phone: values.phone || null,
    address: values.address || null,
    billing_profile: values.fiscal_code
      ? {
          fiscal_code: values.fiscal_code,
          legal_name: values.legal_name,
          trade_register_number: values.trade_register_number || null,
          address: values.fiscal_address,
          city: values.city || null,
          county: values.county || null,
          postal_code: values.postal_code || null,
          country: 'RO' as const,
          vat_registered: values.vat_registered,
          iban: values.iban || null,
          bank_name: values.bank_name || null,
        }
      : null,
  };
}
