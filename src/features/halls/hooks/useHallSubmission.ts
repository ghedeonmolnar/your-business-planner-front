import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { Hall } from '@/features/halls/types';
import {
  hallFormSchema,
  HallFormValues,
} from '@/features/halls/schemas/hallFormSchema';
import { useHallMutations } from '@/features/halls/hooks/useHalls';
import {
  HallCreationAttempt,
  forgetHallCreationAttempt,
  rememberHallCreationAttempt,
} from '@/features/halls/utils/hallCreationRecovery';
import { ApiError } from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';

export function useHallSubmission({
  form,
  initialAttempt,
  recoveryKey,
  editingId,
  sessionGeneration,
  blocked,
  busy,
  buildAttempt,
}: {
  form: UseFormReturn<HallFormValues>;
  initialAttempt?: HallCreationAttempt;
  recoveryKey: string;
  editingId?: string;
  sessionGeneration: number;
  blocked: boolean;
  busy: boolean;
  buildAttempt: (values: HallFormValues) => HallCreationAttempt;
}) {
  const mutations = useHallMutations();
  const submitting = useRef(false);
  const submitted = useRef(initialAttempt);
  const [uncertain, setUncertain] = useState(Boolean(initialAttempt));
  const [conflict, setConflict] = useState(Boolean(initialAttempt?.conflict));
  const [savedHall, setSavedHall] = useState<Hall>();
  const save = async (values: HallFormValues) => {
    if (
      submitting.current ||
      busy ||
      blocked ||
      conflict ||
      savedHall ||
      sessionGeneration !== getSessionGeneration()
    )
      return;
    submitting.current = true;
    Keyboard.dismiss();
    const recovering = Boolean(submitted.current);
    try {
      const attempt =
        submitted.current ?? buildAttempt(hallFormSchema.parse(values));
      if (!editingId) {
        submitted.current = attempt;
        rememberHallCreationAttempt(recoveryKey, attempt);
        setUncertain(true);
      }
      const result = await mutations.save.mutateAsync({
        id: editingId,
        body: attempt.body,
      });
      if (sessionGeneration !== getSessionGeneration()) return;
      if (!editingId) forgetHallCreationAttempt(recoveryKey);
      setSavedHall(result);
    } catch (error) {
      if (sessionGeneration !== getSessionGeneration()) return;
      if (error instanceof ApiError && error.status === 409) {
        setConflict(true);
        if (submitted.current)
          rememberHallCreationAttempt(recoveryKey, {
            ...submitted.current,
            conflict: true,
          });
      } else if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        !recovering
      ) {
        submitted.current = undefined;
        if (!editingId) forgetHallCreationAttempt(recoveryKey);
        setUncertain(false);
      }
      showError(error, 'Nu am putut salva sala.');
    } finally {
      submitting.current = false;
    }
  };
  const submit = () =>
    submitted.current
      ? save(submitted.current.values)
      : form.handleSubmit(save, () =>
          showMessage(
            'Verifică formularul',
            'Corectează câmpurile marcate înainte de salvare.',
          ),
        )();
  return {
    submit,
    uncertain,
    conflict,
    setConflict,
    savedHall,
    saving: mutations.save.isPending,
  };
}
