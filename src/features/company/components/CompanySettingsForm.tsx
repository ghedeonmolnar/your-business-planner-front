import React, { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSaveCompanySettings } from '@/features/company/hooks/useCompany';
import {
  companySettingsSchema,
  CompanySettingsValues,
} from '@/features/company/schemas/companySettingsSchema';
import { CompanyProfile } from '@/features/company/schemas/companyProfileSchemas';
import {
  companyProfileDefaults,
  companyProfilePayload,
} from '@/features/company/utils/companyProfileForm';
import { CompanyGeneralFields } from '@/features/company/components/CompanyGeneralFields';
import { CompanyFiscalFields } from '@/features/company/components/CompanyFiscalFields';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { FormScreenFrame } from '@/shared/components/FormScreenFrame';
import { FormActions } from '@/shared/components/FormActions';
import { QueryState } from '@/shared/components/QueryState';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function CompanySettingsForm({
  company,
  initialTab,
  loadError,
  onReload,
}: {
  company: CompanyProfile;
  initialTab?: 'general' | 'billing';
  loadError?: unknown;
  onReload?: () => void;
}) {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState(initialTab === 'billing' ? 1 : 0);
  const save = useSaveCompanySettings();
  const submitting = useRef(false);
  const form = useAppForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: companyProfileDefaults(company),
  });
  const submit = form.handleSubmit(
    async values => {
      if (submitting.current) return;
      submitting.current = true;
      const generation = getSessionGeneration();
      try {
        const saved = await save.mutateAsync(companyProfilePayload(values));
        if (generation !== getSessionGeneration()) return;
        form.reset(companyProfileDefaults(saved));
        try {
          await refreshProfile();
        } catch (error) {
          if (generation === getSessionGeneration())
            showError(
              error,
              'Datele au fost salvate, dar nu am putut reîncărca profilul.',
            );
          return;
        }
        if (generation === getSessionGeneration())
          showMessage('Date salvate', 'Profilul companiei a fost actualizat.');
      } catch (error) {
        if (generation === getSessionGeneration())
          showError(error, 'Nu am putut actualiza profilul companiei.');
      } finally {
        submitting.current = false;
      }
    },
    errors => {
      const generalInvalid =
        errors.name || errors.email || errors.phone || errors.address;
      setTab(generalInvalid ? 0 : 1);
    },
  );
  const busy = save.isPending || form.formState.isSubmitting;
  return (
    <FormScreenFrame
      title="Editează firma"
      subtitle={
        tab === 0
          ? 'Identitatea și contactele companiei'
          : 'Date fiscale și informații pentru facturi'
      }
      busy={busy}
      hasUnsavedChanges={form.formState.isDirty}
      tabs={
        <AppSegmentedControl
          segments={[{ label: 'Date companie' }, { label: 'Facturare' }]}
          selectedIndex={tab}
          disabled={busy}
          onChangeIndex={setTab}
        />
      }
      footer={
        <FormActions
          busy={busy}
          primary={{
            label:
              tab === 0
                ? 'Salvează datele companiei'
                : 'Salvează datele fiscale',
            onPress: submit,
            disabled: !form.formState.isDirty,
          }}
        />
      }
    >
      <QueryState loading={false} hasData error={loadError} retry={onReload} />
      {tab === 0 ? (
        <CompanyGeneralFields form={form} />
      ) : (
        <CompanyFiscalFields form={form} />
      )}
    </FormScreenFrame>
  );
}
