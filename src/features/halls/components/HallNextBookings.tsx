import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Hall } from '@/features/halls/types';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import {
  formatCalendarDateParts,
  formatCompanyTimeRange,
  formatLongDate,
} from '@/shared/utils/formatDate';

export function HallNextBookings({
  hall,
  onAll,
  onOpen,
}: {
  hall: Hall;
  onAll: () => void;
  onOpen: (id: string) => void;
}) {
  const catalogs = useCatalogs();
  const labels = createCatalogLabelMap(catalogs.data?.event_types);
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, styles.flex]}
        >
          Rezervări viitoare
        </Text>
        <AppButton
          label={`Vezi toate (${hall.future_bookings_count})`}
          variant="ghost"
          size="small"
          multiline
          onPress={onAll}
        />
      </View>
      <Text style={styles.subtitle}>
        {hall.future_bookings_count - hall.tentative_bookings_count} confirmate
        · {hall.tentative_bookings_count} provizorii valabile. Sunt incluse
        evenimentele în desfășurare.
      </Text>
      {hall.next_bookings.length ? (
        hall.next_bookings.map(booking => {
          const date = formatCalendarDateParts(booking.date);
          return (
            <Card
              key={booking.id}
              style={styles.listCard}
              onPress={() => onOpen(booking.id)}
              accessibilityLabel={`Deschide rezervarea ${booking.client_name ?? ''}, ${formatLongDate(booking.date)}`}
            >
              <View style={styles.dateBadge}>
                <Text style={styles.sectionTitle}>{date.day}</Text>
                <Text style={styles.subtitle}>{date.month}</Text>
              </View>
              <View style={styles.labels}>
                <Text style={styles.sectionTitle}>
                  {booking.client_name || 'Client necompletat'}
                </Text>
                <Text style={styles.subtitle}>
                  {getCatalogLabel(labels, booking.type)}
                </Text>
                <Text style={styles.subtitle}>
                  {formatCompanyTimeRange(booking.starts_at, booking.ends_at) ||
                    'Program necompletat'}
                </Text>
                <BookingStatusPill status={booking.status} />
              </View>
            </Card>
          );
        })
      ) : (
        <Text style={styles.subtitle}>
          Nu există rezervări viitoare pentru această sală.
        </Text>
      )}
    </Card>
  );
}
