import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerCard } from '@/features/company/components/CustomerCard';
import { CustomerEventFilter } from '@/features/company/components/CustomerEventFilter';
import { CustomerListHeader } from '@/features/company/components/CustomerListHeader';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { useCustomerFilters } from '@/features/company/hooks/useCustomerFilters';
import { useCustomers } from '@/features/company/hooks/useCustomers';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Screen } from '@/shared/components/Screen';
import { RootStackParamList } from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';

export function CustomersScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [creating, setCreating] = useState(false);
  const filters = useCustomerFilters();
  const query = useCustomers(filters.queryFilters);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  const filtered = Boolean(filters.range || filters.search.trim());

  return (
    <Screen style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View>
            <CustomerListHeader
              search={filters.search}
              onSearch={filters.setSearch}
              sort={filters.sort}
              onSort={filters.setSort}
              total={query.data?.pages[0]?.total}
              onAdd={() => setCreating(true)}
            >
              <CustomerEventFilter
                form={filters.form}
                expanded={filters.expanded}
                range={filters.range}
                onToggle={filters.toggleExpanded}
                onApply={filters.apply}
                onReset={filters.resetDates}
              />
            </CustomerListHeader>
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              retry={() => query.refetch()}
            />
          </View>
        }
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onOpen={() =>
              navigation.navigate('CustomerHistory', { clientId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={CustomerSeparator}
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <View style={styles.empty}>
              <EmptyState
                icon="people-outline"
                title={
                  filtered
                    ? 'Niciun client pentru filtrele alese'
                    : 'Adaugă primul client'
                }
                message={
                  filtered
                    ? 'Schimbă intervalul evenimentelor sau căutarea pentru a vedea alte rezultate.'
                    : 'Păstrează aici clienții și istoricul rezervărilor lor.'
                }
              />
              {filtered ? (
                <AppButton
                  label="Resetează filtrele"
                  variant="soft"
                  onPress={filters.resetAll}
                />
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          query.hasNextPage ? (
            <AppButton
              label="Încarcă mai mulți clienți"
              disabled={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
              style={styles.loadMore}
            />
          ) : null
        }
      />
      {creating ? (
        <DirectoryForm kind="clients" onClose={() => setCreating(false)} />
      ) : null}
    </Screen>
  );
}

function CustomerSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  separator: { height: theme.spacing.sm },
  empty: { gap: theme.spacing.md },
  loadMore: { marginTop: theme.spacing.lg },
});
