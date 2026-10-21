import { showDialog } from '@/shared/feedback/dialogStore';

export const showMessage = (title: string, message: string) => {
  showDialog({ title, message, confirmLabel: 'OK' });
};
