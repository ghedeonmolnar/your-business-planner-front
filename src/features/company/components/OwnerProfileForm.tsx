import React, { useRef } from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSaveOwnerProfile } from '@/features/company/hooks/useCompanyProfile';
import {
  ownerProfileSchema,
  OwnerProfileValues,
} from '@/features/company/schemas/ownerProfileSchema';
import { FormActions } from '@/shared/components/FormActions';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';

export function OwnerProfileForm({ onClose }: { onClose: () => void }) {
  const { user, retryBootstrap } = useAuth();
  const save = useSaveOwnerProfile();
  const submitting = useRef(false);
  const form = useAppForm<OwnerProfileValues>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  });
  const submit = form.handleSubmit(values => {
    if (submitting.current) return;
    submitting.current = true;
    save.mutate(values, {
      onSuccess: () => {
        onClose();
        retryBootstrap();
      },
      onError: error => showError(error, 'Nu am putut salva profilul tău.'),
      onSettled: () => {
        submitting.current = false;
      },
    });
  });
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      title="Profilul meu"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={save.isPending}
          primary={{ label: 'Salvează profilul', onPress: submit }}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
        required
        label="Numele tău"
        placeholder="Nume și prenume"
      />
    </FormModalFrame>
  );
}
