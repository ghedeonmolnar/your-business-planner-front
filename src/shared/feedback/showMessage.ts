import { DialogRequest, showDialog } from '@/shared/feedback/dialogStore';

export type MessageOptions = Partial<
  Omit<DialogRequest, 'title' | 'message' | 'sessionGeneration'>
>;

export const showMessage = (
  title: string,
  message: string,
  options: MessageOptions = {},
) => {
  showDialog({ title, message, confirmLabel: 'OK', ...options });
};
