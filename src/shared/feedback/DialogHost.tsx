import React from 'react';
import { AppDialog } from '@/shared/components/AppDialog';
import { closeDialog, useActiveDialog } from '@/shared/feedback/dialogStore';

export function DialogHost() {
  const dialog = useActiveDialog();

  const cancel = () => {
    if (dialog) {
      closeDialog(dialog.id);
    }
  };

  const confirm = () => {
    if (!dialog) {
      return;
    }

    closeDialog(dialog.id);
    dialog.onConfirm?.();
  };

  return <AppDialog dialog={dialog} onCancel={cancel} onConfirm={confirm} />;
}
