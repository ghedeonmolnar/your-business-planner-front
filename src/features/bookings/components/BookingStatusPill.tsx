import React from 'react';
import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { MetaPill, MetaPillTone } from '@/shared/components/MetaPill';
import { IconName } from '@/shared/types/icon';

const statusPresentation: Record<
  Booking['status'],
  { tone: MetaPillTone; icon: IconName }
> = {
  confirmed: { tone: 'success', icon: 'checkmark-circle' },
  completed: { tone: 'success', icon: 'checkmark-circle' },
  cancelled: { tone: 'danger', icon: 'close-circle' },
  expired: { tone: 'danger', icon: 'close-circle' },
  tentative: { tone: 'warning', icon: 'time-outline' },
};

export function BookingStatusPill({ status }: { status: Booking['status'] }) {
  return (
    <MetaPill
      label={bookingStatusLabels[status]}
      {...statusPresentation[status]}
    />
  );
}
