import React from 'react';
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
import { AppButton } from '@/shared/components/AppButton';
import { showError } from '@/shared/feedback/showError';

export function CompanySettingsForm({ onClose }: { onClose: () => void }) {
  const { user, retryBootstrap } = useAuth();
  const save = useSaveCompanySettings();
  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: user?.company?.name ?? '',
      email: user?.company?.email ?? '',
      phone: user?.company?.phone ?? '',
      address: user?.company?.address ?? '',
    },
  });
  const submit = form.handleSubmit(values =>
    save.mutate(
      {
        ...values,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
      },
      {
        onSuccess: () => {
          onClose();
          retryBootstrap();
        },
        onError: error =>
          showError(error, 'Nu am putut salva profilul companiei.'),
      },
    ),
  );
  return (
    <FormModalFrame
      visible
      title="Datele companiei"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <AppButton
          label="Salvează"
          disabled={save.isPending}
          onPress={submit}
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
    </FormModalFrame>
  );
}
