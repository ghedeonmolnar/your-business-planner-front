import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookingAdvancedFilterValues,
  bookingFilterSchema,
  EMPTY_BOOKING_ADVANCED_FILTERS,
} from '@/features/bookings/schemas/bookingFilterSchema';
import { bookingListStyles as styles } from '@/features/bookings/components/bookingListStyles';
import { CatalogOption } from '@/features/catalogs/types';
import { ControlledDateRangeFields } from '@/shared/components/ControlledDateRangeFields';
import {
  ControlledSelectField,
  SelectOptionsState,
} from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { ApiError } from '@/shared/api/apiError';
import { showError } from '@/shared/feedback/showError';
import { formatShortDate } from '@/shared/utils/formatDate';

export function BookingAdvancedFilters({
  values,
  eventTypes,
  eventTypesState,
  financeEnabled,
  onApply,
  onClose,
}: {
  values: BookingAdvancedFilterValues;
  eventTypes: CatalogOption[];
  eventTypesState?: SelectOptionsState;
  financeEnabled: boolean;
  onApply: (values: BookingAdvancedFilterValues) => void;
  onClose: () => void;
}) {
  const form = useForm<BookingAdvancedFilterValues>({
    resolver: zodResolver(bookingFilterSchema),
    defaultValues: values,
  });
  const draft = form.watch();
  const apply = form.handleSubmit(onApply, errors => {
    const message =
      errors.date_from?.message ??
      errors.date_to?.message ??
      'Verifică filtrele selectate.';
    showError(new ApiError(message, 422), message);
  });
  return (
    <FormModalFrame
      visible
      fitContent
      title="Filtre avansate"
      closeLabel="Închide filtrele avansate"
      onClose={onClose}
      footer={
        <FormActions
          primary={{ label: 'Aplică filtrele', onPress: apply }}
          secondary={{
            label: 'Resetează',
            onPress: () => form.reset(EMPTY_BOOKING_ADVANCED_FILTERS),
          }}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.subtitle}>Intervalul evenimentelor</Text>
        <ControlledDateRangeFields
          control={form.control}
          fromName="date_from"
          toName="date_to"
        />
        <ControlledSelectField
          control={form.control}
          name="type"
          label="Tipul evenimentului"
          single
          singleEmptyValue=""
          options={eventTypes}
          optionsState={eventTypesState}
          placeholder="Toate tipurile"
          searchPlaceholder="Caută tipul evenimentului"
        />
        {financeEnabled ? (
          <ControlledSelectField
            control={form.control}
            name="payment_status"
            label="Starea plății"
            single
            singleEmptyValue=""
            options={[
              { id: 'unpaid', name: 'Neachitate' },
              { id: 'partial', name: 'Achitate parțial' },
              { id: 'paid', name: 'Achitate integral' },
            ]}
            placeholder="Toate plățile"
            searchPlaceholder="Caută starea plății"
          />
        ) : null}
        <View style={styles.preview}>
          <Text style={styles.monthCount}>Previzualizare</Text>
          <Text style={[styles.muted, styles.previewText]}>
            {draft.date_from
              ? formatShortDate(draft.date_from)
              : 'Fără dată de început'}{' '}
            –{' '}
            {draft.date_to
              ? formatShortDate(draft.date_to)
              : 'Fără dată de sfârșit'}
          </Text>
          <Text style={[styles.muted, styles.previewText]}>
            Sunt incluse și rezervările care se suprapun cu perioada aleasă.
          </Text>
        </View>
      </View>
    </FormModalFrame>
  );
}
