import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { Event } from '@/features/events/types';
import { buildEventReservationMessage } from '@/features/events/utils/eventReservationMessage';
import {
  canShareEventReservation,
  eventReservationShareDeadline,
} from '@/features/events/utils/eventReservationShareAvailability';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
import {
  eventContactPhone,
  openWhatsAppShare,
} from '@/shared/utils/contactLinks';

const MAXIMUM_TIMEOUT_MS = 2_147_483_647;
const emptyMascotNames = new Map<string, string>();

export function EventReservationShareButton({ event }: { event: Event }) {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now);
  const deadline = eventReservationShareDeadline(event);
  const canShare = canShareEventReservation(event, user?.role, now);

  useEffect(() => {
    if (!canShare || deadline === null) {
      return;
    }

    const timeout = setTimeout(
      () => setNow(Date.now()),
      Math.min(Math.max(deadline - Date.now(), 0), MAXIMUM_TIMEOUT_MS),
    );
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setNow(Date.now());
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [canShare, deadline, now]);

  if (!canShare) {
    return null;
  }

  return (
    <AppButton
      fullWidth
      icon="logo-whatsapp"
      label="Trimite detaliile rezervării"
      multiline
      style={{ marginTop: theme.spacing.md }}
      onPress={() => {
        if (!canShareEventReservation(event, user?.role)) {
          setNow(Date.now());
          return;
        }

        openWhatsAppShare(
          eventContactPhone(event),
          buildEventReservationMessage(event, emptyMascotNames),
        );
      }}
      variant="outline"
    />
  );
}
