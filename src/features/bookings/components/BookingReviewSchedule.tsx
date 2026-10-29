import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingPayload } from '@/features/bookings/types';
import { bookingReviewStyles as styles } from '@/features/bookings/components/bookingReviewStyles';
import {
  formatCompanyLongDateTime,
  formatLongDate,
} from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';

export function BookingReviewSchedule({
  date,
  starts_at,
  ends_at,
}: Pick<BookingPayload, 'date' | 'starts_at' | 'ends_at'>) {
  if (!starts_at && !ends_at) {
    return (
      <View style={styles.schedule}>
        <Text style={styles.label}>Data evenimentului</Text>
        <Text style={styles.scheduleValue}>{formatLongDate(date)}</Text>
        <Text style={styles.label}>Orele se completează ulterior.</Text>
      </View>
    );
  }
  return (
    <View style={styles.schedule}>
      <View style={styles.scheduleRow}>
        <View style={styles.scheduleIcon}>
          <Ionicons
            accessible={false}
            name="time-outline"
            size={theme.typography.sectionTitle}
            color={theme.colors.menu.primary}
          />
        </View>
        <View style={styles.scheduleDetails}>
          <Text style={styles.label}>Început</Text>
          <Text style={styles.scheduleValue}>
            {formatCompanyLongDateTime(starts_at)}
          </Text>
        </View>
      </View>
      <View style={styles.scheduleRow}>
        <View style={styles.scheduleIcon}>
          <Ionicons
            accessible={false}
            name="flag-outline"
            size={theme.typography.sectionTitle}
            color={theme.colors.menu.primary}
          />
        </View>
        <View style={styles.scheduleDetails}>
          <Text style={styles.label}>Sfârșit</Text>
          <Text style={styles.scheduleValue}>
            {formatCompanyLongDateTime(ends_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}
