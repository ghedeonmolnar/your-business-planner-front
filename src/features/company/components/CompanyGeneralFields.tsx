import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { CompanySettingsValues } from '@/features/company/schemas/companySettingsSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function CompanyGeneralFields({
  form,
}: {
  form: UseFormReturn<CompanySettingsValues>;
}) {
  return (
    <>
      <FormPanel title="Date companie">
        <ControlledTextField
          control={form.control}
          name="name"
          required
          label="Numele companiei"
          placeholder="Companie"
        />
        <ControlledTextField
          control={form.control}
          name="email"
          label="Email companie"
          placeholder="email@exemplu.ro"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <ControlledTextField
          control={form.control}
          name="phone"
          label="Telefon companie"
          placeholder="Telefon (opțional)"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <ControlledTextField
          control={form.control}
          name="address"
          label="Adresă companie"
          placeholder="Adresă de contact (opțional)"
          multiline
        />
        <Text style={styles.muted}>
          Acestea sunt datele de contact. Datele oficiale pentru facturi se
          editează în tabul „Facturare”.
        </Text>
      </FormPanel>
    </>
  );
}
