import React from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingScheduleInputs } from '@/features/bookings/utils/bookingSchedule';
import { ControlledBookingTimeField } from '@/features/bookings/components/ControlledBookingTimeField';
import { formatLongDate } from '@/shared/utils/formatDate';

export function BookingTimeFields({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  const { control, setValue } = form;
  const date = useWatch({ control, name: 'date' });
  const start = useWatch({ control, name: 'starts_at' });
  const end = useWatch({ control, name: 'ends_at' });
  const status = useWatch({ control, name: 'status' });
  const required =
    ['confirmed', 'completed'].includes(status) || Boolean(start || end);
  return (
    <>
      <ControlledBookingTimeField
        control={control}
        name="starts_at"
        label="Ora de început"
        required={required}
        date={date}
        disabled={!date}
        onSelectionChange={nextStart => {
          setValue(
            'ends_at',
            nextStart
              ? bookingScheduleInputs(date, nextStart, end).ends_at
              : '',
            { shouldDirty: true },
          );
          form.clearErrors(['starts_at', 'ends_at']);
        }}
      />
      <ControlledBookingTimeField
        control={control}
        name="ends_at"
        label="Ora de sfârșit"
        required={required}
        date={date}
        start={start}
        disabled={!date || !start}
      />
      {end && end.slice(0, 10) !== date ? (
        <Text>
          Sfârșitul este a doua zi, {formatLongDate(end.slice(0, 10))}.
        </Text>
      ) : null}
    </>
  );
}
