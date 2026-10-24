import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';

export const BOOKING_COMPACT_WIDTH = 360;

export function BookingDetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const { width, fontScale } = useWindowDimensions();
  const compact = width / fontScale < BOOKING_COMPACT_WIDTH;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.field, compact && styles.stacked]}
    >
      <Text style={[styles.fieldLabel, compact && styles.stackedField]}>
        {label}
      </Text>
      <Text style={[styles.fieldValue, compact && styles.stackedField]}>
        {value}
      </Text>
    </View>
  );
}
