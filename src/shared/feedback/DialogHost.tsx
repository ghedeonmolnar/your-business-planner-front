import React from 'react';
import { AppDialog } from '@/shared/components/AppDialog';
import { closeDialog, useActiveDialog } from '@/shared/feedback/dialogStore';
import { useButtonAction } from '@/shared/hooks/useButtonAction';

export function DialogHost() {
  const dialog = useActiveDialog();
  const confirmation = useButtonAction(() => {
    if (!dialog) return;
    try {
      const result = dialog.onConfirm?.();
      if (
        result !== null &&
        (typeof result === 'object' || typeof result === 'function') &&
        'then' in result &&
        typeof result.then === 'function'
      ) {
        return Promise.resolve(result).finally(() => closeDialog(dialog.id));
      }
      closeDialog(dialog.id);
    } catch (error) {
      closeDialog(dialog.id);
      throw error;
    }
  });

  const cancel = () => {
    if (dialog && !confirmation.pending) {
      closeDialog(dialog.id);
    }
  };

  return (
    <AppDialog
      dialog={dialog}
      busy={confirmation.pending}
      onCancel={cancel}
      onConfirm={confirmation.press}
    />
  );
}
