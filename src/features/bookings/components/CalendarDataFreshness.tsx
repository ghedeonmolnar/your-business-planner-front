import React from 'react';
import { Text } from 'react-native-paper';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';

export function CalendarDataFreshness({
  label,
  updatedAt,
  fetching,
  stale,
  offline = false,
}: {
  label: string;
  updatedAt: number;
  fetching: boolean;
  stale: boolean;
  offline?: boolean;
}) {
  if (!updatedAt || (!stale && !offline)) return null;
  return (
    <Text style={calendarStyles.muted}>
      {label} ·{' '}
      {offline
        ? 'Fără conexiune. Datele nu pot fi reverificate · '
        : fetching
          ? 'Se actualizează · '
          : 'Date vechi · '}
      Ultima actualizare:{' '}
      {formatCompanyDateTime(new Date(updatedAt).toISOString())}
    </Text>
  );
}
