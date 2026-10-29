import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { UseFormReturn, useWatch } from 'react-hook-form';
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
import { theme } from '@/shared/theme/theme';

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
  const status = useWatch({ control, name: 'status' });
  const availability = useBookingDateAvailability(hallId, bookingId);
  return (
    <>
      <ControlledSelectField
        control={control}
        name="hall_id"
        required
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
        required
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
        required
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
        required
        label="Stare rezervare"
        single
        options={Object.entries(bookingStatusLabels)
          .filter(
            ([id]) =>
              id !== 'expired' && (Boolean(bookingId) || id !== 'cancelled'),
          )
          .map(([id, name]) => ({ id, name }))}
        placeholder="Alege starea"
        searchPlaceholder="Caută stare"
      />
      {status === 'tentative' ? (
        <View accessible style={styles.statusHint}>
          <Ionicons
            accessible={false}
            name="information-circle-outline"
            color={theme.colors.menu.help}
            size={theme.typography.bodyLarge}
          />
          <Text style={styles.statusHintText}>
            În așteptarea avansului, sala rămâne disponibilă. După încasarea
            avansului, schimbă starea în Confirmată pentru a rezerva data.
          </Text>
        </View>
      ) : null}
      <BookingTimeFields form={form} />
    </>
  );
}

const styles = StyleSheet.create({
  statusHint: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.menu.invitationsSoft,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  statusHintText: {
    color: theme.colors.menu.text,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    lineHeight: theme.typography.subtitle,
  },
});
