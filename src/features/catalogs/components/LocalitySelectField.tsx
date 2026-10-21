import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';

type LocalitySelectFieldProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  label: string;
  name: FieldPath<T>;
};

export function LocalitySelectField<T extends FieldValues>({
  control,
  label,
  name,
}: LocalitySelectFieldProps<T>) {
  const catalogsQuery = useCatalogs();
  const options = catalogsQuery.data?.bihor_localities ?? [];

  return (
    <ControlledSelectField
      control={control}
      disabled={catalogsQuery.isLoading && !options.length}
      label={label}
      name={name}
      noItemsText="Nu există localități în Bihor"
      options={options}
      placeholder={
        catalogsQuery.isLoading ? 'Se încarcă...' : 'Selectează localitatea'
      }
      searchPlaceholder="Caută localitate..."
      single
      singleEmptyValue=""
    />
  );
}
