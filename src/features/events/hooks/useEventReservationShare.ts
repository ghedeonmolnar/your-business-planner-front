import { useRef } from 'react';
import { Platform } from 'react-native';
import { Event } from '@/features/events/types';
import { confirmEventReservationShare } from '@/features/events/utils/confirmEventReservationShare';

export const useEventReservationShare = (
  mascotNamesById: Map<string, string>,
) => {
  const pendingEvent = useRef<Event | null>(null);

  const afterDismiss = () => {
    const event = pendingEvent.current;

    if (event) {
      pendingEvent.current = null;
      confirmEventReservationShare(event, mascotNamesById);
    }
  };

  const afterSave = (event: Event, closeForm: () => void) => {
    pendingEvent.current = event;
    closeForm();

    if (Platform.OS !== 'ios') {
      afterDismiss();
    }
  };

  return { afterDismiss, afterSave };
};
