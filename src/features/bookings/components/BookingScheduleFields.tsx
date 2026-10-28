import React from 'react';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { BookingTimeFields } from '@/features/bookings/components/BookingTimeFields';
import { bookingScheduleInputs } from '@/features/bookings/utils/bookingSchedule';
import {
  ControlledSelectField,
  SelectOptionsState,
} from '@/shared/components/ControlledSelectField';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { useBookingDateAvailability } from '@/features/bookings/hooks/useBookingDateAvailability';
import { companyNow } from '@/shared/utils/formatDate';

export function BookingScheduleFields({
  form,
  halls,
  hallId,
  bookingId,
  selectedHallId,
  retainedType,
  hallsState,
  onHallSelected,
}: {
  form: UseFormReturn<BookingFormValues>;
  halls: DirectoryItem[];
  hallId: string;
  bookingId?: string;
  selectedHallId?: string;
  retainedType?: string;
  hallsState?: SelectOptionsState;
  onHallSelected?: (id: string) => void;
}) {
  const catalogs = useCatalogs();
  const { control } = form;
  const availability = useBookingDateAvailability(hallId, bookingId);
  return (
    <>
      <ControlledSelectField
        control={control}
        name="hall_id"
        label="Sală"
        icon="business-outline"
        optionsState={hallsState}
        single
        options={halls
          .filter(hall => hall.is_active || hall.id === selectedHallId)
          .map(hall => ({
            id: hall.id,
            name: hall.name + (hall.is_active ? '' : ' · Arhivată'),
          }))}
        placeholder="Alege sala"
        searchPlaceholder="Caută sala"
        onSelectionChange={values => onHallSelected?.(values[0] ?? '')}
      />
      <ControlledDateField
        control={control}
        name="date"
        label="Data evenimentului"
        placeholder="Alege data"
        minimumDate={
          bookingId
            ? undefined
            : new Date(`${companyNow().format('YYYY-MM-DD')}T00:00:00`)
        }
        disabled={!hallId}
        availability={availability}
        onSelectionChange={date => {
          const schedule = bookingScheduleInputs(
            date,
            form.getValues('starts_at'),
            form.getValues('ends_at'),
          );
          form.setValue('starts_at', schedule.starts_at, { shouldDirty: true });
          form.setValue('ends_at', schedule.ends_at, { shouldDirty: true });
          form.clearErrors(['starts_at', 'ends_at']);
        }}
      />
      <ControlledSelectField
        control={control}
        name="type"
        label="Tip eveniment"
        optionsState={{
          loading: catalogs.isLoading,
          error: catalogs.error,
          onRetry: () => catalogs.refetch(),
        }}
        single
        options={
          retainedType &&
          !catalogs.data?.event_types.some(option => option.id === retainedType)
            ? [
                ...(catalogs.data?.event_types ?? []),
                {
                  id: retainedType,
                  name: retainedType + ' · Valoare păstrată',
                },
              ]
            : (catalogs.data?.event_types ?? [])
        }
        placeholder="Alege tipul"
        searchPlaceholder="Caută tip"
      />
      <ControlledSelectField
        control={control}
        name="status"
        label="Stare rezervare"
        single
        options={Object.entries(bookingStatusLabels)
          .filter(([id]) => id !== 'expired')
          .map(([id, name]) => ({ id, name }))}
        placeholder="Alege starea"
        searchPlaceholder="Caută stare"
      />
      <Text>
        În așteptarea avansului, sala rămâne disponibilă. După încasarea
        avansului, schimbă starea în Confirmată pentru a rezerva data.
      </Text>
      <BookingTimeFields form={form} />
    </>
  );
}
