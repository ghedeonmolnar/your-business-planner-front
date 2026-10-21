import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { bookingPayload } from '@/features/bookings/utils/bookingFormValues';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  formatCompanyDateTime,
  formatLongDate,
} from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export function BookingReviewFields({
  form,
  hallName,
  clientName,
}: {
  form: UseFormReturn<BookingFormValues>;
  hallName?: string | null;
  clientName?: string | null;
}) {
  const values = form.watch();
  const services = useFieldArray({
    control: form.control,
    name: 'extra_services',
  });
  const preview = bookingPayload(values);
  return (
    <View style={styles.content}>
      <Text style={styles.subtitle}>
        {hallName ?? 'Sala selectată'} · {clientName ?? 'Clientul selectat'}
      </Text>
      <Text style={styles.text}>
        {formatLongDate(values.date)} · {bookingStatusLabels[values.status]}
      </Text>
      <Text style={styles.text}>
        Început: {formatCompanyDateTime(preview.starts_at)}
      </Text>
      <Text style={styles.text}>
        Sfârșit: {formatCompanyDateTime(preview.ends_at)}
      </Text>
      <Text style={styles.text}>
        Minim garantat: {values.minimum_guests} persoane
      </Text>
      <Text style={styles.text}>
        Preț meniu: {formatExactMoney(preview.menu_price)}
      </Text>
      <Text style={styles.text}>
        Avans convenit: {formatExactMoney(preview.agreed_advance)}
      </Text>
      {services.fields.map((service, index) => (
        <Text key={service.id} style={styles.text}>
          {service.name}:{' '}
          {formatExactMoney(preview.extra_services[index]?.amount)}
        </Text>
      ))}
      <Text style={styles.text}>Personal alocat: {values.staff.length}</Text>
      <Text style={styles.muted}>
        La salvare se verifică disponibilitatea sălii și a personalului.
      </Text>
      <ControlledTextField
        control={form.control}
        name="notes"
        label="Detalii discutate"
        placeholder="Meniu, decor, acces furnizori…"
        multiline
      />
    </View>
  );
}
