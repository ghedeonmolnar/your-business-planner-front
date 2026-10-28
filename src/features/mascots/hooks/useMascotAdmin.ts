import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { useState } from 'react';
import {
  useCreateMascot,
  useDeleteMascot,
  useForceDeleteMascot,
  useUpdateMascot,
} from '@/features/mascots/hooks/useMascots';
import { MascotFormValues } from '@/features/mascots/schemas/mascotSchema';
import { Mascot } from '@/features/mascots/types';
import { buildMascotFormData } from '@/features/mascots/utils/mascotFormData';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export const useMascotAdmin = () => {
  const createMascot = useCreateMascot();
  const updateMascot = useUpdateMascot();
  const deleteMascot = useDeleteMascot();
  const forceDeleteMascot = useForceDeleteMascot();
  const [editingMascot, setEditingMascot] = useState<Mascot | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);

  const openCreate = () => {
    setEditingMascot(null);
    setFormVisible(true);
  };

  const openEdit = (mascot: Mascot) => {
    setEditingMascot(mascot);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingMascot(null);
    setFormVisible(false);
  };

  const save = (values: MascotFormValues) => {
    const payload = buildMascotFormData(values);
    const onError = (mutationError: unknown) => {
      showError(mutationError, 'Nu am putut salva mascota.');
    };

    if (editingMascot) {
      updateMascot.mutate(
        { id: editingMascot.id, payload },
        { onSuccess: closeForm, onError },
      );
      return;
    }

    createMascot.mutate(payload, { onSuccess: closeForm, onError });
  };

  const confirmPermanentDelete = (mascot: Mascot) => {
    confirmAction({
      title: 'Ștergere definitivă',
      message: `Sigur dorești să ștergi mascota ${mascot.name}?`,
      cancelLabel: 'Nu',
      confirmLabel: 'Da',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return forceDeleteMascot.mutateAsync(mascot.id).catch(mutationError => {
          if (actionGeneration !== getSessionGeneration()) return;
          showError(mutationError, 'Nu am putut șterge definitiv mascota.');
        });
      },
    });
  };

  const confirmDelete = (mascot: Mascot) => {
    if (!mascot.is_active) {
      confirmPermanentDelete(mascot);
      return;
    }

    confirmAction({
      title: 'Dezactivare mascotă',
      message: `Mascota ${mascot.name} va fi trecută în inactiv. Apasă din nou pe coș pentru ștergerea definitivă.`,
      confirmLabel: 'Dezactivează',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return deleteMascot.mutateAsync(mascot.id).catch(mutationError => {
          if (actionGeneration !== getSessionGeneration()) return;
          showError(mutationError, 'Nu am putut șterge mascota.');
        });
      },
    });
  };

  return {
    closeForm,
    confirmDelete,
    editingMascot,
    isFormVisible,
    isSaving: createMascot.isPending || updateMascot.isPending,
    isDeleting: deleteMascot.isPending || forceDeleteMascot.isPending,
    openCreate,
    openEdit,
    save,
  };
};
