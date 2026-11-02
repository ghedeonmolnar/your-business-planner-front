import React, { useRef } from 'react';
import { AppDialog } from '@/shared/components/AppDialog';
import { closeDialog, useActiveDialog } from '@/shared/feedback/dialogStore';
import { useButtonAction } from '@/shared/hooks/useButtonAction';

export function DialogHost() {
  const dialog = useActiveDialog();
  const action = useRef<'confirm' | 'cancel'>('confirm');
  const confirmation = useButtonAction(() => {
    if (!dialog) return;
    try {
      const result =
        action.current === 'confirm'
          ? dialog.onConfirm?.()
          : dialog.onCancel?.();
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
      action.current = 'cancel';
      return confirmation.press();
    }
  };

  const confirm = () => {
    action.current = 'confirm';
    return confirmation.press();
  };

  return (
    <AppDialog
      dialog={dialog}
      busy={confirmation.pending}
      onCancel={cancel}
      onConfirm={confirm}
    />
  );
}
