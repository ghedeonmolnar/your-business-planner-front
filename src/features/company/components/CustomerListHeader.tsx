import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CustomerSort } from '@/features/company/types';
import { AppButton } from '@/shared/components/AppButton';
import { ContentSection } from '@/shared/components/ContentSection';
import { SearchField } from '@/shared/components/SearchField';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';

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
  const singleColumn = useSingleColumnLayout();
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
            shape="rounded"
            backgroundColor={theme.colors.menu.primary}
            color={theme.colors.menu.surface}
            onPress={onAdd}
          />
        }
      />
      <View style={styles.search}>
        <SearchField
          value={search}
          onChange={onSearch}
          label="Caută în clienți"
          placeholder="Caută după nume sau telefon"
          style={styles.searchField}
          inputStyle={styles.searchInput}
        />
      </View>
      {children}
      <View style={styles.results}>
        <Text accessibilityLiveRegion="polite" style={styles.total}>
          {total === undefined
            ? 'Clienți'
            : `${total} ${total === 1 ? 'client' : 'clienți'}`}
        </Text>
        <View
          style={[styles.sort, singleColumn ? styles.stackedSort : undefined]}
        >
          <Text style={styles.sortLabel}>Sortează după</Text>
          <View style={singleColumn ? styles.fullWidth : styles.selector}>
            <SearchableSelect<CustomerSort>
              style={styles.sortField}
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
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.lg, marginBottom: theme.spacing.sm },
  search: {
    backgroundColor: theme.colors.menu.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xs,
  },
  searchField: {
    backgroundColor: theme.colors.menu.background,
    borderRadius: theme.radius.md,
    marginBottom: 0,
  },
  searchInput: {
    color: theme.colors.menu.text,
    fontSize: theme.typography.bodySmall,
  },
  results: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  total: {
    color: theme.colors.menu.text,
    flexGrow: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  sort: {
    alignItems: 'center',
    flexBasis: '60%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: theme.spacing.sm,
  },
  sortLabel: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
  },
  selector: { flex: 1, minWidth: 0 },
  fullWidth: { width: '100%' },
  stackedSort: {
    alignItems: 'stretch',
    flexBasis: '100%',
    flexDirection: 'column',
  },
  sortField: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    minHeight: theme.spacing.xl * 2,
  },
});
