import React from 'react';
import { Text } from 'react-native-paper';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';

export function CalendarDataFreshness({
  label,
  updatedAt,
  fetching,
  stale,
}: {
  label: string;
  updatedAt: number;
  fetching: boolean;
  stale: boolean;
}) {
  if (!updatedAt || !stale) return null;
  return (
    <Text style={calendarStyles.muted}>
      {label} · {fetching ? 'Se actualizează · ' : stale ? 'Date vechi · ' : ''}
      Ultima actualizare:{' '}
      {formatCompanyDateTime(new Date(updatedAt).toISOString())}
    </Text>
  );
}
