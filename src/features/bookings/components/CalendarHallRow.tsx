import React from 'react';
import { HallDay } from '@/features/bookings/api/bookingsApi';
import { RecordCard } from '@/shared/components/RecordCard';
import { InfoRow } from '@/shared/components/InfoRow';
import { MetaPill } from '@/shared/components/MetaPill';
import { IconBadge } from '@/shared/components/IconBadge';
import { formatCompanyTimeRange } from '@/shared/utils/formatDate';

export function CalendarHallRow({
  hall,
  typeLabel,
  onPress,
}: {
  hall: HallDay;
  typeLabel: string;
  onPress?: () => void;
}) {
  const free = hall.status === 'free';
  const inactive = hall.status === 'inactive';
  const status = free
    ? 'Liberă'
    : hall.status === 'inactive'
      ? 'Inactivă'
      : hall.status === 'tentative'
        ? 'Provizorie'
        : hall.status === 'completed'
          ? 'Finalizată'
          : 'Rezervat';
  const schedule = formatCompanyTimeRange(hall.starts_at, hall.ends_at);
  const description =
    hall.status === 'inactive'
      ? 'Indisponibilă pentru rezervări noi'
      : free
        ? 'Liberă'
        : typeLabel || 'Rezervare';
  return (
    <RecordCard
      title={hall.name}
      subtitle={description}
      leading={<IconBadge icon="business-outline" />}
      badge={
        <MetaPill
          label={status}
          tone={
            free
              ? 'success'
              : inactive
                ? 'neutral'
                : hall.status === 'tentative'
                  ? 'warning'
                  : 'primary'
          }
        />
      }
      onPress={onPress}
      accessibilityLabel={
        inactive
          ? `${hall.name}, inactivă`
          : `${hall.booking_id ? 'Deschide rezervarea' : 'Rezervă sala'} ${hall.name}`
      }
      accessibilityHint={`${description}, ${status}${schedule ? `, ${schedule}` : ''}`}
    >
      <InfoRow
        icon="time-outline"
        value={free || inactive ? '—' : schedule || 'Program necompletat'}
      />
    </RecordCard>
  );
}
