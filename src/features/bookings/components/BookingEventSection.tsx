import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Booking } from '@/features/bookings/types';
import { BookingDetailField } from '@/features/bookings/components/BookingDetailField';
import { BookingDetailsSection } from '@/features/bookings/components/BookingDetailsSection';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

export function BookingEventSection({
  booking,
  canManage,
}: {
  booking: Booking;
  canManage: boolean;
}) {
  return (
    <BookingDetailsSection
      title="Detalii eveniment"
      icon="reader-outline"
      initiallyExpanded
    >
      <BookingDetailField
        label="Început"
        value={formatCompanyDateTime(booking.starts_at)}
      />
      <BookingDetailField
        label="Sfârșit"
        value={formatCompanyDateTime(booking.ends_at)}
      />
      {booking.expires_at ? (
        <BookingDetailField
          label="Termen provizoriu"
          value={formatCompanyDateTime(booking.expires_at)}
        />
      ) : null}
      {canManage ? (
        <>
          <BookingDetailField
            label="Invitați minimi"
            value={booking.minimum_guests ?? 'Necompletat'}
          />
          <BookingDetailField
            label="Meniuri comandate"
            value={booking.final_guests ?? 'În așteptarea confirmării'}
          />
          <BookingDetailField
            label="Meniu"
            value={booking.menu_name || 'Necompletat'}
          />
          <BookingDetailField
            label="Preț meniu"
            value={
              booking.menu_price === undefined
                ? 'Indisponibil'
                : formatExactMoney(booking.menu_price)
            }
          />
          {booking.final_guests == null &&
          !['cancelled', 'expired'].includes(booking.status) ? (
            <View style={styles.alert}>
              <Ionicons
                accessible={false}
                name="information-circle"
                color={theme.colors.menu.text}
                size={theme.typography.title}
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  Meniurile nu sunt confirmate
                </Text>
                <Text style={styles.body}>
                  Completează meniurile și numărul exact de invitați.
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </BookingDetailsSection>
  );
}
