import { showDialog } from '@/shared/feedback/dialogStore';

type ConfirmActionOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export const confirmAction = ({
  cancelLabel = 'Anulează',
  ...options
}: ConfirmActionOptions) => {
  showDialog({ ...options, cancelLabel });
};
