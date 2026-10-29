import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { Booking, BookingPayload } from '@/features/bookings/types';
import {
  bookingCommercialAmounts,
  bookingServiceAmountLabel,
  serviceAppliesToAdultMenus,
  serviceAppliesToChildMenus,
} from '@/features/bookings/utils/bookingExtraServices';
import { bookingReviewStyles as styles } from '@/features/bookings/components/bookingReviewStyles';
import { Card } from '@/shared/components/Card';
import { formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, styles.rowLabel]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function BookingReviewCommercial({
  form,
  booking,
  preview,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  preview: BookingPayload;
}) {
  const values = form.watch();
  const services = useFieldArray({
    control: form.control,
    name: 'extra_services',
  });
  const amounts = bookingCommercialAmounts(preview);
  const agreed =
    (values.status === 'tentative' || Boolean(booking)) &&
    Number(preview.agreed_advance) > 0;
  const received =
    ['confirmed', 'completed'].includes(values.status) &&
    Number(values.advance_received_amount?.replace(',', '.') || 0) > 0;
  const dueDate = values.status === 'tentative' && preview.advance_due_at;
  return (
    <>
      <Card style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Meniuri și costuri
        </Text>
        <ReviewRow
          label="Meniuri estimate (adulți)"
          value={values.estimated_guests || values.minimum_guests}
        />
        {booking ? (
          <ReviewRow
            label="Meniuri confirmate"
            value={values.final_guests || 'Se completează ulterior'}
          />
        ) : null}
        <ReviewRow
          label="Preț meniu adulți"
          value={formatExactMoney(preview.menu_price)}
        />
        {booking && Number(values.child_guests) > 0 ? (
          <ReviewRow
            label="Meniuri copii"
            value={`${values.child_guests} × ${formatExactMoney(preview.child_menu_price)}`}
          />
        ) : null}
        {services.fields.length > 0 ? (
          <View style={styles.divider}>
            <Text style={styles.value}>Servicii suplimentare</Text>
            {services.fields.map((service, index) => (
              <ReviewRow
                key={service.id}
                label={service.name}
                value={bookingServiceAmountLabel(
                  preview.extra_services[index] ?? service,
                )}
              />
            ))}
            {preview.extra_services.some(service =>
              serviceAppliesToAdultMenus(service.pricing_type),
            ) ? (
              <ReviewRow
                label="Preț meniu adulți cu servicii"
                value={formatExactMoney(amounts.adultMenuPrice)}
              />
            ) : null}
            {booking &&
            Number(values.child_guests) > 0 &&
            preview.extra_services.some(service =>
              serviceAppliesToChildMenus(service.pricing_type),
            ) ? (
              <ReviewRow
                label="Preț meniu copii cu servicii"
                value={formatExactMoney(amounts.childMenuPrice)}
              />
            ) : null}
          </View>
        ) : null}
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Valoare estimată</Text>
          <Text style={styles.totalAmount}>
            {formatExactMoney(amounts.total)}
          </Text>
        </View>
      </Card>
      {agreed || received || dueDate ? (
        <Card style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Avans
          </Text>
          {agreed ? (
            <ReviewRow
              label="Avans convenit"
              value={formatExactMoney(preview.agreed_advance)}
            />
          ) : null}
          {dueDate ? (
            <ReviewRow label="Scadență" value={formatLongDate(dueDate)} />
          ) : null}
          {received ? (
            <>
              <ReviewRow
                label="Avans primit"
                value={formatExactMoney(
                  values.advance_received_amount?.replace(',', '.'),
                )}
              />
              <ReviewRow
                label="Metoda de încasare"
                value={
                  values.advance_received_method === 'cash'
                    ? 'Cash'
                    : values.advance_received_method === 'card'
                      ? 'Card'
                      : 'Transfer bancar'
                }
              />
              <ReviewRow
                label="Data încasării"
                value={formatLongDate(values.advance_received_at)}
              />
            </>
          ) : null}
        </Card>
      ) : null}
    </>
  );
}
