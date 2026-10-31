import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text } from 'react-native-paper';
import {
  CompanySettingsValues,
  hasCompanyFiscalData,
} from '@/features/company/schemas/companySettingsSchema';
import { companyProfilePayload } from '@/features/company/utils/companyProfileForm';
import { BillingProfileSummary } from '@/features/company/components/BillingProfileSummary';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { FormPanel } from '@/shared/components/FormPanel';
import { InfoRow } from '@/shared/components/InfoRow';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function CompanyBillingDetails({
  form,
}: {
  form: UseFormReturn<CompanySettingsValues>;
}) {
  const values = form.watch();
  const profile = companyProfilePayload(values).billing_profile;
  return (
    <>
      <FormPanel title="Localizare fiscală">
        <ControlledTextField
          control={form.control}
          name="city"
          label="Localitate"
          placeholder="Localitate"
        />
        <ControlledTextField
          control={form.control}
          name="county"
          label="Județ"
          placeholder="Județ"
        />
        <ControlledTextField
          control={form.control}
          name="postal_code"
          label="Cod poștal"
          placeholder="Cod poștal"
          keyboardType="number-pad"
        />
        <InfoRow label="Țară" value="România (RO)" icon="location-outline" />
        <Text style={styles.muted}>
          În prezent, facturarea este disponibilă doar pentru firme din România.
        </Text>
      </FormPanel>
      <FormPanel title="Statut TVA">
        <ControlledSwitchField
          control={form.control}
          name="vat_registered"
          label="Plătitoare de TVA"
          activeText="Plătitoare de TVA"
          inactiveText="Neplătitoare de TVA"
        />
        <Text style={styles.muted}>
          Verifică statutul după informațiile oficiale ale firmei.
        </Text>
      </FormPanel>
      <FormPanel title="Cont bancar (opțional)">
        <ControlledTextField
          control={form.control}
          name="iban"
          label="IBAN"
          placeholder="RO…"
          autoCapitalize="characters"
        />
        <ControlledTextField
          control={form.control}
          name="bank_name"
          label="Bancă"
          placeholder="Numele băncii"
        />
        <Text style={styles.muted}>
          IBAN-ul și banca sunt opționale și nu se preiau de la ANAF.
        </Text>
      </FormPanel>
      <FormPanel title="Previzualizare date factură">
        {profile && hasCompanyFiscalData(values) ? (
          <BillingProfileSummary profile={profile} />
        ) : (
          <Text style={styles.muted}>
            Completează CUI-ul, denumirea juridică și adresa fiscală pentru
            previzualizare.
          </Text>
        )}
      </FormPanel>
    </>
  );
}
