import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { HallDay } from '@/features/bookings/api/bookingsApi';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { getCatalogLabel } from '@/features/catalogs/utils/catalogLabels';
import { DirectoryItem } from '@/features/company/types';
import { theme } from '@/shared/theme/theme';

export function CalendarHallGroup({
  title,
  halls,
  typeLabels,
  free = false,
  partial,
  onReserve,
  onOpen,
}: {
  title: string;
  halls: HallDay[];
  typeLabels: ReadonlyMap<string, string>;
  free?: boolean;
  partial: boolean;
  onReserve: (hall: DirectoryItem | null) => void;
  onOpen: (bookingId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.title, free ? styles.freeTitle : undefined]}
      >
        {title} · {halls.length}
        {partial ? ' în lista încărcată' : ''}
      </Text>
      {!halls.length ? (
        <Text style={styles.empty}>
          {partial
            ? 'Nicio sală liberă în lista încărcată.'
            : 'Nicio sală liberă în această zi.'}
        </Text>
      ) : null}
      {halls.map(hall => (
        <View key={hall.id} style={styles.rows}>
          {hall.bookings?.length ? (
            hall.bookings.map(booking => (
              <CalendarHallRow
                key={booking.id}
                hall={{
                  ...hall,
                  booking_id: booking.id,
                  status: booking.status,
                  type: booking.type,
                  starts_at: booking.starts_at,
                  ends_at: booking.ends_at,
                }}
                typeLabel={getCatalogLabel(typeLabels, booking.type)}
                onPress={() => onOpen(booking.id)}
              />
            ))
          ) : (
            <CalendarHallRow
              hall={hall}
              typeLabel={getCatalogLabel(typeLabels, hall.type)}
              onPress={
                hall.status === 'inactive'
                  ? undefined
                  : () =>
                      hall.booking_id
                        ? onOpen(hall.booking_id)
                        : onReserve({
                            id: hall.id,
                            name: hall.name,
                            capacity: hall.capacity,
                            minimum_guests: hall.minimum_guests,
                            is_active: hall.is_active ?? true,
                          })
              }
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm },
  rows: { gap: theme.spacing.xs },
  title: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  freeTitle: { color: theme.colors.menu.success },
  empty: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
});
