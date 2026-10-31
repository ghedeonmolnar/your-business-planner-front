import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  ChangePasswordValues,
} from '@/features/auth/schemas/changePasswordSchema';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function useChangePasswordForm() {
  const save = useChangePassword();
  const submitting = useRef(false);
  const form = useAppForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });
  const submit = form.handleSubmit(values => {
    if (submitting.current) return;
    const generation = getSessionGeneration();
    confirmAction({
      title: 'Schimbi parola?',
      message:
        'Vei fi deconectat de pe toate dispozitivele. Modificările nesalvate din cont se vor pierde. Autentifică-te apoi cu parola nouă.',
      confirmLabel: 'Schimbă parola',
      onConfirm: () => {
        if (submitting.current || generation !== getSessionGeneration()) return;
        submitting.current = true;
        return save
          .mutateAsync(values)
          .then(() => {
            form.reset();
          })
          .catch(error => {
            if (generation === getSessionGeneration())
              showError(error, 'Nu am putut schimba parola.');
          })
          .finally(() => {
            submitting.current = false;
          });
      },
    });
  });
  return { form, submit, busy: save.isPending };
}
