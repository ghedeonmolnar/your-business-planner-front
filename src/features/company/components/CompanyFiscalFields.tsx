import React, { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { Keyboard } from 'react-native';
import {
  CompanySettingsValues,
  hasCompanyFiscalData,
} from '@/features/company/schemas/companySettingsSchema';
import { FiscalProfile } from '@/features/company/schemas/companyProfileSchemas';
import { useFiscalLookup } from '@/features/company/hooks/useCompanyProfile';
import {
  isValidFiscalCode,
  normalizeFiscalCode,
} from '@/features/company/utils/fiscalProfileValues';
import { FiscalLookupReview } from '@/features/company/components/FiscalLookupReview';
import { CompanyBillingDetails } from '@/features/company/components/CompanyBillingDetails';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { AppButton } from '@/shared/components/AppButton';
import { FormPanel } from '@/shared/components/FormPanel';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { showError } from '@/shared/feedback/showError';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function CompanyFiscalFields({
  form,
}: {
  form: UseFormReturn<CompanySettingsValues>;
}) {
  const lookup = useFiscalLookup();
  const busy = useFormBusy();
  const finding = useRef(false);
  const [proposal, setProposal] = useState<FiscalProfile | null>(null);
  const required = hasCompanyFiscalData(form.watch());
  const code = normalizeFiscalCode(form.watch('fiscal_code'));
  const findCompany = () => {
    if (finding.current || busy) return;
    const requestedCode = normalizeFiscalCode(form.getValues('fiscal_code'));
    if (!isValidFiscalCode(requestedCode)) {
      form.setError('fiscal_code', {
        message: 'Completează un CUI valid, doar cu cifre.',
      });
      return;
    }
    finding.current = true;
    const generation = getSessionGeneration();
    lookup.mutate(requestedCode, {
      onSuccess: data => {
        if (
          generation !== getSessionGeneration() ||
          normalizeFiscalCode(form.getValues('fiscal_code')) !== requestedCode
        )
          return;
        Keyboard.dismiss();
        setProposal({ ...data, iban: null, bank_name: null });
      },
      onError: error => {
        if (generation === getSessionGeneration())
          showError(
            error,
            'Nu am putut căuta firma după CUI. Poți completa datele manual.',
          );
      },
      onSettled: () => {
        finding.current = false;
      },
    });
  };
  const applyProposal = () => {
    if (!proposal || busy || code !== proposal.fiscal_code) return;
    const values = {
      fiscal_code: proposal.fiscal_code,
      legal_name: proposal.legal_name,
      trade_register_number: proposal.trade_register_number ?? '',
      fiscal_address: proposal.address,
      city: proposal.city ?? '',
      county: proposal.county ?? '',
      postal_code: proposal.postal_code ?? '',
      vat_registered: proposal.vat_registered,
    };
    for (const field of Object.keys(values) as (keyof typeof values)[])
      form.setValue(field, values[field], {
        shouldDirty: true,
        shouldValidate: true,
      });
    setProposal(null);
  };
  return (
    <>
      <FormPanel title="Identitate fiscală">
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
          disabled={lookup.isPending || busy}
          onPress={findCompany}
        />
        <Text style={styles.muted}>
          Datele ANAF sunt propuneri. Le poți revizui și aplica explicit, apoi
          corecta înainte de salvare.
        </Text>
        <ControlledTextField
          control={form.control}
          name="legal_name"
          label="Denumire juridică"
          required={required}
          placeholder="Denumirea din actele firmei"
          multiline
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
      </FormPanel>
      <CompanyBillingDetails form={form} />
      {proposal && proposal.fiscal_code === code ? (
        <FiscalLookupReview
          proposal={proposal}
          onApply={applyProposal}
          onClose={() => setProposal(null)}
        />
      ) : null}
    </>
  );
}
