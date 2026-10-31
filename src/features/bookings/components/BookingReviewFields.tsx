import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { Booking } from '@/features/bookings/types';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { BookingReviewSchedule } from '@/features/bookings/components/BookingReviewSchedule';
import { BookingReviewCommercial } from '@/features/bookings/components/BookingReviewCommercial';
import { bookingReviewStyles as styles } from '@/features/bookings/components/bookingReviewStyles';
import { bookingPayload } from '@/features/bookings/utils/bookingFormValues';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { theme } from '@/shared/theme/theme';

export function BookingReviewFields({
  form,
  booking,
  hallName,
  clientName,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  hallName?: string | null;
  clientName?: string | null;
}) {
  const values = form.watch();
  const preview = bookingPayload(values, booking);
  return (
    <View style={styles.content}>
      <View style={styles.identity}>
        <Text accessibilityRole="header" style={styles.title}>
          {hallName || 'Sala selectată'}
        </Text>
        <View style={styles.client}>
          <Ionicons
            accessible={false}
            name="person-outline"
            size={theme.typography.subtitle}
            color={theme.colors.menu.muted}
          />
          <Text style={styles.clientName}>
            {clientName || 'Clientul selectat'}
          </Text>
        </View>
        <View style={styles.status}>
          <BookingStatusPill status={values.status} />
        </View>
      </View>
      <BookingReviewSchedule
        date={preview.date}
        starts_at={preview.starts_at}
        ends_at={preview.ends_at}
      />
      <BookingReviewCommercial
        form={form}
        booking={booking}
        preview={preview}
      />
      {values.status === 'completed' ? (
        <Text>
          Finalizarea manuală păstrează soldul și nu înregistrează o încasare.
          Orice rest de încasat rămâne datorat de client.
        </Text>
      ) : null}
      <ControlledTextField
        control={form.control}
        name="notes"
        label="Note interne"
        placeholder="Detalii private pentru echipă (opțional)"
        multiline
      />
    </View>
  );
}
