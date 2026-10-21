import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSaveOwnerProfile } from '@/features/company/hooks/useCompanyProfile';
import {
  ownerProfileSchema,
  OwnerProfileValues,
} from '@/features/company/schemas/ownerProfileSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';

export function OwnerProfileForm({ onClose }: { onClose: () => void }) {
  const { user, retryBootstrap } = useAuth();
  const save = useSaveOwnerProfile();
  const form = useForm<OwnerProfileValues>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  });
  const submit = form.handleSubmit(values =>
    save.mutate(values, {
      onSuccess: () => {
        onClose();
        retryBootstrap();
      },
      onError: error => showError(error, 'Nu am putut salva profilul tău.'),
    }),
  );
  return (
    <FormModalFrame
      visible
      title="Profilul meu"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <AppButton
          label="Salvează profilul"
          disabled={save.isPending}
          onPress={submit}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
        label="Numele tău"
        placeholder="Nume și prenume"
      />
    </FormModalFrame>
  );
}
