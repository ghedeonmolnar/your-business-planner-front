import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomerSort } from '@/features/company/types';
import { AppButton } from '@/shared/components/AppButton';
import { ContentSection } from '@/shared/components/ContentSection';
import { ListResultsHeader } from '@/shared/components/ListResultsHeader';
import { SearchField } from '@/shared/components/SearchField';
import { FormInput } from '@/shared/components/FormInput';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';

type CustomerListHeaderProps = {
  search: string;
  sort: CustomerSort;
  total?: number;
  onSearch: (value: string) => void;
  onSort: (value: CustomerSort) => void;
  onAdd: () => void;
  children: ReactNode;
};

const sortOptions: { id: CustomerSort; name: string }[] = [
  { id: 'name_asc', name: 'Nume (A–Z)' },
  { id: 'name_desc', name: 'Nume (Z–A)' },
  { id: 'bookings_desc', name: 'Rezervări (desc.)' },
];

export function CustomerListHeader({
  search,
  sort,
  total,
  onSearch,
  onSort,
  onAdd,
  children,
}: CustomerListHeaderProps) {
  return (
    <View style={styles.header}>
      <ContentSection
        title="Clienți"
        subtitle="Gestionează clienții și istoricul rezervărilor."
        size="page"
        action={
          <AppButton
            label="Adaugă client"
            icon="add"
            size="small"
            onPress={onAdd}
          />
        }
      />
      <SearchField
        value={search}
        onChange={onSearch}
        label="Caută în clienți"
        placeholder="Caută după nume sau telefon"
      />
      {children}
      <ListResultsHeader
        label={
          total === undefined
            ? 'Clienți'
            : `${total} ${total === 1 ? 'client' : 'clienți'}`
        }
        sortControl={
          <FormInput label="Sortează după">
            <SearchableSelect<CustomerSort>
              allowClear={false}
              label="Sortează clienții"
              placeholder="Sortare"
              noItemsText="Nu există opțiuni"
              searchPlaceholder="Caută sortare"
              options={sortOptions}
              selectedValues={[sort]}
              single
              onChange={values => onSort(values[0] ?? 'name_asc')}
            />
          </FormInput>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
});
