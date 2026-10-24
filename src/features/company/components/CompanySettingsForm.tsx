import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSaveCompanySettings } from '@/features/company/hooks/useCompany';
import {
  companySettingsSchema,
  CompanySettingsValues,
} from '@/features/company/schemas/companySettingsSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { showError } from '@/shared/feedback/showError';
import { CompanyProfile } from '@/features/company/schemas/companyProfileSchemas';
import {
  companyProfileDefaults,
  companyProfilePayload,
} from '@/features/company/utils/companyProfileForm';
import { CompanyFiscalFields } from '@/features/company/components/CompanyFiscalFields';

export function CompanySettingsForm({
  company,
  onClose,
}: {
  company: CompanyProfile;
  onClose: () => void;
}) {
  const { retryBootstrap } = useAuth();
  const save = useSaveCompanySettings();
  const submitting = useRef(false);
  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: companyProfileDefaults(company),
  });
  const submit = form.handleSubmit(values => {
    if (submitting.current) return;
    submitting.current = true;
    save.mutate(companyProfilePayload(values), {
      onSuccess: () => {
        onClose();
        retryBootstrap();
      },
      onError: error =>
        showError(error, 'Nu am putut salva profilul companiei.'),
      onSettled: () => {
        submitting.current = false;
      },
    });
  });
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      title="Profilul firmei"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={save.isPending}
          primary={{ label: 'Salvează profilul firmei', onPress: submit }}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
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
      />
      <ControlledTextField
        control={form.control}
        name="phone"
        label="Telefon companie"
        placeholder="Telefon"
        keyboardType="phone-pad"
      />
      <ControlledTextField
        control={form.control}
        name="address"
        label="Adresă companie"
        placeholder="Adresă"
      />
      <CompanyFiscalFields form={form} />
    </FormModalFrame>
  );
}
