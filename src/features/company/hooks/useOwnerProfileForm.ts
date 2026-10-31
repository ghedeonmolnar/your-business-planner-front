import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSaveOwnerProfile } from '@/features/company/hooks/useCompanyProfile';
import {
  ownerProfileSchema,
  OwnerProfileValues,
} from '@/features/company/schemas/ownerProfileSchema';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function useOwnerProfileForm() {
  const { user, refreshProfile } = useAuth();
  const save = useSaveOwnerProfile();
  const submitting = useRef(false);
  const form = useAppForm<OwnerProfileValues>({
    resolver: zodResolver(ownerProfileSchema),
    mode: 'onChange',
    defaultValues: { name: user?.name ?? '' },
  });
  const submit = form.handleSubmit(async values => {
    if (submitting.current || user?.role !== 'owner') return;
    submitting.current = true;
    const generation = getSessionGeneration();
    try {
      await save.mutateAsync(values);
      if (generation !== getSessionGeneration()) return;
      form.reset(values);
      try {
        await refreshProfile();
      } catch (error) {
        if (generation === getSessionGeneration())
          showError(
            error,
            'Numele a fost salvat, dar nu am putut reîncărca profilul.',
          );
        return;
      }
      if (generation === getSessionGeneration())
        showMessage('Profil salvat', 'Numele tău a fost actualizat.');
    } catch (error) {
      if (generation === getSessionGeneration())
        showError(error, 'Nu am putut actualiza profilul tău.');
    } finally {
      submitting.current = false;
    }
  });
  return { form, submit, busy: save.isPending || form.formState.isSubmitting };
}
