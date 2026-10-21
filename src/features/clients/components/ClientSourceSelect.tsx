import React from 'react';
import { Control } from 'react-hook-form';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { ClientFormValues } from '@/features/clients/schemas/clientSchema';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';

type ClientSourceSelectProps = {
  control: Control<ClientFormValues>;
};

export function ClientSourceSelect({ control }: ClientSourceSelectProps) {
  const catalogsQuery = useCatalogs();
  const options = catalogsQuery.data?.client_sources ?? [];

  return (
    <ControlledSelectField
      control={control}
      label="Sursă"
      name="source"
      noItemsText="Nu există surse"
      options={options}
      placeholder={catalogsQuery.isLoading ? 'Se încarcă...' : 'Selectează sursa'}
      searchPlaceholder="Caută sursa..."
      single
      singleEmptyValue=""
    />
  );
}
