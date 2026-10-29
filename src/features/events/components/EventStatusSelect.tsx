import React from 'react';
import { Control } from 'react-hook-form';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  EventFormInput,
  EventFormValues,
} from '@/features/events/schemas/eventSchema';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';

type EventStatusSelectProps = {
  control: Control<EventFormInput, unknown, EventFormValues>;
  editing?: boolean;
};

const fallbackStatuses = [
  { id: 'confirmed', name: 'Rezervat' },
  { id: 'partial_details', name: 'Rezervat cu detalii parțiale' },
  { id: 'completed', name: 'Finalizat' },
  { id: 'cancelled', name: 'Anulat' },
];

export function EventStatusSelect({
  control,
  editing = false,
}: EventStatusSelectProps) {
  const catalogsQuery = useCatalogs();
  const catalogOptions = catalogsQuery.data?.event_statuses?.length
    ? catalogsQuery.data.event_statuses
    : fallbackStatuses;
  const options = editing
    ? catalogOptions
    : catalogOptions.filter(option =>
        ['confirmed', 'partial_details'].includes(option.id),
      );

  return (
    <ControlledSelectField
      control={control}
      required
      label="Status"
      name="status"
      noItemsText="Nu există statusuri"
      options={options}
      placeholder={
        catalogsQuery.isLoading ? 'Se încarcă...' : 'Selectează status'
      }
      searchPlaceholder="Caută status..."
      single
      singleEmptyValue="confirmed"
    />
  );
}
