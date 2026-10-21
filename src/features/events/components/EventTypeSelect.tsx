import React from 'react';
import { Control } from 'react-hook-form';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  EventFormInput,
  EventFormValues,
} from '@/features/events/schemas/eventSchema';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';

type EventTypeSelectProps = {
  control: Control<EventFormInput, unknown, EventFormValues>;
};

export function EventTypeSelect({ control }: EventTypeSelectProps) {
  const catalogsQuery = useCatalogs();
  const options = catalogsQuery.data?.event_types ?? [];

  return (
    <ControlledSelectField
      control={control}
      label="Tip"
      name="type"
      noItemsText="Nu există tipuri de eveniment"
      options={options}
      placeholder={catalogsQuery.isLoading ? 'Se încarcă...' : 'Selectează tip'}
      searchPlaceholder="Caută tip..."
      single
      singleEmptyValue=""
    />
  );
}
