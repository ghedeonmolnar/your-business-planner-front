import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text } from 'react-native-paper';
import {
  CompanySettingsValues,
  hasCompanyFiscalData,
} from '@/features/company/schemas/companySettingsSchema';
import { useFiscalLookup } from '@/features/company/hooks/useCompanyProfile';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { AppButton } from '@/shared/components/AppButton';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function CompanyFiscalFields({
  form,
}: {
  form: UseFormReturn<CompanySettingsValues>;
}) {
  const lookup = useFiscalLookup();
  const required = hasCompanyFiscalData(form.watch());
  const findCompany = () => {
    const code = form
      .getValues('fiscal_code')
      .trim()
      .replace(/^RO\s*/i, '');
    if (!/^[1-9][0-9]{1,9}$/.test(code)) {
      form.setError('fiscal_code', {
        message: 'Completează un CUI valid, doar cu cifre.',
      });
      return;
    }
    form.setValue('fiscal_code', code, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const initialValues = form.getValues();
    lookup.mutate(code, {
      onSuccess: data => {
        if (form.getValues('fiscal_code') !== code) {
          return;
        }
        const proposed = {
          legal_name: data.legal_name,
          trade_register_number: data.trade_register_number ?? '',
          fiscal_address: data.address,
          city: data.city ?? '',
          county: data.county ?? '',
          postal_code: data.postal_code ?? '',
        };
        for (const field of Object.keys(
          proposed,
        ) as (keyof typeof proposed)[]) {
          if (form.getValues(field) === initialValues[field]) {
            form.setValue(field, proposed[field], {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }
        if (form.getValues('vat_registered') === initialValues.vat_registered) {
          form.setValue('vat_registered', data.vat_registered, {
            shouldDirty: true,
          });
        }
        showMessage(
          'Date fiscale completate',
          'Verifică datele preluate de la ANAF și salvează profilul firmei.',
        );
      },
      onError: error => showError(error, 'Nu am putut căuta firma după CUI.'),
    });
  };
  return (
    <>
      <Text style={styles.subtitle}>Date de facturare</Text>
      <Text style={styles.muted}>
        Introdu CUI-ul și completăm datele publice ale firmei. Le poți corecta
        înainte de salvare.
      </Text>
      <ControlledTextField
        control={form.control}
        name="fiscal_code"
        label="CUI"
        required={required}
        placeholder="Codul fiscal, fără RO"
        keyboardType="number-pad"
      />
      <AppButton
        label="Completează după CUI"
        loading={lookup.isPending}
        loadingLabel="Se caută firma…"
        icon="search-outline"
        variant="outline"
        disabled={lookup.isPending || form.formState.isSubmitting}
        onPress={findCompany}
      />
      <ControlledTextField
        control={form.control}
        name="legal_name"
        label="Denumire juridică"
        required={required}
        placeholder="Denumirea din actele firmei"
      />
      <ControlledTextField
        control={form.control}
        name="trade_register_number"
        label="Număr registrul comerțului"
        placeholder="J…/…/…"
      />
      <ControlledTextField
        control={form.control}
        name="fiscal_address"
        label="Adresă fiscală"
        required={required}
        placeholder="Sediul fiscal al firmei"
        multiline
      />
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
      <ControlledSwitchField
        control={form.control}
        name="vat_registered"
        label="Statut TVA"
        activeText="Plătitoare de TVA"
        inactiveText="Neplătitoare de TVA"
      />
      <Text style={styles.muted}>
        Țara: România. Completează contul bancar folosit de firma ta; acesta nu
        se preia automat de la ANAF.
      </Text>
      <ControlledTextField
        control={form.control}
        name="iban"
        label="IBAN"
        placeholder="RO… (fără spații)"
        autoCapitalize="characters"
      />
      <ControlledTextField
        control={form.control}
        name="bank_name"
        label="Bancă"
        placeholder="Numele băncii"
      />
    </>
  );
}
