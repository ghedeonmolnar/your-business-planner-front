import { useCreateEventReviewLink } from '@/features/events/hooks/useEvents';
import { Event } from '@/features/events/types';
import {
  eventContactPhone,
  openWhatsAppShare,
} from '@/shared/utils/contactLinks';
import { showError } from '@/shared/feedback/showError';

export const useSendEventReviewLink = () => {
  const createLink = useCreateEventReviewLink();

  const sendReviewLink = (event: Event) => {
    createLink.mutate(event.id, {
      onSuccess: review => {
        openWhatsAppShare(eventContactPhone(event), review.share_message);
      },
      onError: error => {
        showError(error, 'Nu am putut genera linkul de recenzie.');
      },
    });
  };

  return { sendReviewLink, isSending: createLink.isPending };
};
