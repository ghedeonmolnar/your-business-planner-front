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
      {canManage ? (
        <>
          <BookingDetailField
            label="Minimul sălii (adulți)"
            value={booking.minimum_guests ?? 'Necompletat'}
          />
          <BookingDetailField
            label="Meniuri estimate (adulți)"
            value={
              booking.estimated_guests ??
              booking.minimum_guests ??
              'Necompletat'
            }
          />
          <BookingDetailField
            label="Meniuri confirmate"
            value={booking.final_guests ?? 'Numărul exact nu a fost completat'}
          />
          <BookingDetailField
            label="Meniu"
            value={booking.menu_name || 'Necompletat'}
          />
          <BookingDetailField
            label="Preț meniu adulți"
            value={
              booking.menu_price === undefined
                ? 'Indisponibil'
                : formatExactMoney(booking.menu_price)
            }
          />
          {Number(booking.child_guests) > 0 ? (
            <>
              <BookingDetailField
                label="Meniuri copii"
                value={booking.child_guests ?? 0}
              />
              <BookingDetailField
                label="Preț meniu copii"
                value={formatExactMoney(booking.child_menu_price)}
              />
            </>
          ) : null}
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
                  Numărul exact de meniuri nu a fost completat
                </Text>
                <Text style={styles.body}>
                  Numărul final de adulți se poate completa cu aproximativ 7
                  zile înainte de eveniment. Până atunci se folosește estimarea,
                  respectând minimul sălii.
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </BookingDetailsSection>
  );
}
