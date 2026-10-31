import React from 'react';
import { useChangePasswordForm } from '@/features/auth/hooks/useChangePasswordForm';
import { ChangePasswordFields } from '@/features/auth/components/ChangePasswordFields';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';

export function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const { form, submit, busy } = useChangePasswordForm();
  const { isDirty, isValid } = form.formState;
  return (
    <FormModalFrame
      visible
      title="Schimbă parola"
      busy={busy}
      onClose={onClose}
      hasUnsavedChanges={isDirty}
      footer={
        <FormActions
          busy={busy}
          primary={{
            label: 'Schimbă parola',
            onPress: submit,
            disabled: !isDirty || !isValid,
          }}
        />
      }
    >
      <ChangePasswordFields form={form} />
    </FormModalFrame>
  );
}
