import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { ControlledBookingTimeField } from '@/features/bookings/components/ControlledBookingTimeField';
import { DatePickerField } from '@/shared/components/DatePickerField';

export function BookingStaffScheduleFields({
  form,
  index,
}: {
  form: UseFormReturn<BookingFormValues>;
  index: number;
}) {
  const assignment = form.watch(`staff.${index}`);
  const eventDate = form.watch('date');
  return (
    <>
      {(['starts_at', 'ends_at'] as const).map(field => {
        const name = `staff.${index}.${field}` as const;
        const date = assignment?.[field]?.slice(0, 10) || eventDate;
        const start = field === 'starts_at';
        return (
          <React.Fragment key={field}>
            <Controller
              control={form.control}
              name={name}
              render={({ field: input }) => (
                <DatePickerField
                  required
                  label={
                    start
                      ? 'Data începerii lucrului'
                      : 'Data încheierii lucrului'
                  }
                  placeholder="Alege data"
                  value={date}
                  onBlur={input.onBlur}
                  onChange={selected => {
                    if (selected === date && input.value) return;
                    const clock = input.value?.split(' ')[1] ?? '00:00';
                    input.onChange(`${selected} ${clock}`);
                  }}
                />
              )}
            />
            <ControlledBookingTimeField
              control={form.control}
              name={name}
              date={date}
              end={false}
              required
              label={
                start ? 'Ora începerii lucrului' : 'Ora încheierii lucrului'
              }
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
