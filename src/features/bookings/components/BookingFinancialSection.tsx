import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Booking } from '@/features/bookings/types';
import {
  bookingCommercialAmounts,
  bookingServiceAmountLabel,
  serviceAppliesToAdultMenus,
  serviceAppliesToChildMenus,
} from '@/features/bookings/utils/bookingExtraServices';
import { BookingDetailsSection } from '@/features/bookings/components/BookingDetailsSection';
import {
  BookingDetailField,
  BOOKING_COMPACT_WIDTH,
} from '@/features/bookings/components/BookingDetailField';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';
import { formatExactMoney } from '@/shared/utils/money';
import { formatLongDate } from '@/shared/utils/formatDate';

export function BookingFinancialSection({
  booking,
  financeEnabled,
}: {
  booking: Booking;
  financeEnabled: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const compact = width / fontScale < BOOKING_COMPACT_WIDTH;
  const amounts = bookingCommercialAmounts(booking);
  const metrics = [
    {
      label: 'Minim contractual',
      value: booking.minimum_amount,
      style: undefined,
    },
    ...(financeEnabled
      ? [
          {
            label: 'Încasat',
            value: booking.paid_amount,
            style: styles.success,
          },
          {
            label: 'Rest de încasat',
            value: booking.balance_due,
            style: styles.danger,
          },
        ]
      : []),
  ];
  return (
    <BookingDetailsSection
      title="Financiar"
      icon="wallet-outline"
      initiallyExpanded
    >
      <View style={[styles.metrics, compact && styles.stacked]}>
        {metrics.map(metric => {
          const value =
            metric.value === undefined
              ? 'Indisponibil'
              : formatExactMoney(metric.value);
          return (
            <View
              key={metric.label}
              accessible
              accessibilityLabel={`${metric.label}: ${value}`}
              style={[styles.metric, compact && styles.stackedMetric]}
            >
              <Text style={[styles.metricValue, metric.style]}>{value}</Text>
              <Text style={styles.subtitle}>{metric.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.divider}>
        {booking.extra_services?.some(service =>
          serviceAppliesToAdultMenus(service.pricing_type),
        ) ? (
          <BookingDetailField
            label="Preț meniu adulți cu servicii"
            value={formatExactMoney(amounts.adultMenuPrice)}
          />
        ) : null}
        {Number(booking.child_guests) > 0 &&
        booking.extra_services?.some(service =>
          serviceAppliesToChildMenus(service.pricing_type),
        ) ? (
          <BookingDetailField
            label="Preț meniu copii cu servicii"
            value={formatExactMoney(amounts.childMenuPrice)}
          />
        ) : null}
        <BookingDetailField
          label="Avans convenit"
          value={
            booking.agreed_advance === undefined
              ? 'Indisponibil'
              : formatExactMoney(booking.agreed_advance)
          }
        />
        <BookingDetailField
          label="Valoare estimată"
          value={
            booking.total_amount === undefined
              ? 'Indisponibil'
              : formatExactMoney(booking.total_amount)
          }
        />
        {booking.advance_due_at ? (
          <BookingDetailField
            label="Scadența avansului"
            value={formatLongDate(booking.advance_due_at)}
          />
        ) : null}
        {booking.extra_services?.map((service, index) => (
          <BookingDetailField
            key={`${index}-${service.name}`}
            label={service.name}
            value={bookingServiceAmountLabel(service)}
          />
        ))}
      </View>
    </BookingDetailsSection>
  );
}
