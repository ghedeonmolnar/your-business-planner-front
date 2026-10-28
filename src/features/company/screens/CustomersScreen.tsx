import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
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
import { QueryState } from '@/shared/components/QueryState';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppButton } from '@/shared/components/AppButton';
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
              searchOpen={filters.searchOpen}
              onToggleSearch={filters.toggleSearch}
              onSearch={filters.setSearch}
              sort={filters.sort}
              onSort={filters.setSort}
              total={query.data?.pages[0]?.total}
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
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
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
        ItemSeparatorComponent={ListItemSeparator}
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
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
              action={
                filtered
                  ? { label: 'Resetează filtrele', onPress: filters.resetAll }
                  : undefined
              }
            />
          ) : undefined
        }
        ListFooterComponent={
          <PaginationFooter
            hasMore={Boolean(query.hasNextPage)}
            loading={query.isFetchingNextPage}
            error={query.isFetchNextPageError ? query.error : undefined}
            onLoadMore={() => query.fetchNextPage()}
            label="Încarcă mai mulți clienți"
          />
        }
      />
      <View style={styles.create}>
        <AppButton
          label="Adaugă client"
          loading={creating}
          icon="add"
          onPress={() => setCreating(true)}
        />
      </View>
      {creating ? (
        <DirectoryForm kind="clients" onClose={() => setCreating(false)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
  create: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
