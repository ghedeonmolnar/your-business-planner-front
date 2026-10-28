import { showDialog } from '@/shared/feedback/dialogStore';
import type { ButtonAction } from '@/shared/hooks/useButtonAction';

type ConfirmActionOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: ButtonAction;
};

export const confirmAction = ({
  cancelLabel = 'Anulează',
  ...options
}: ConfirmActionOptions) => {
  showDialog({ ...options, cancelLabel });
};
