import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHalls } from '@/features/halls/hooks/useHalls';
import { HallCard } from '@/features/halls/components/HallCard';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { HallStatus } from '@/features/halls/types';
import { RootStackParamList } from '@/shared/navigation/types';
import { Screen } from '@/shared/components/Screen';
import { SearchField } from '@/shared/components/SearchField';
import { AppButton } from '@/shared/components/AppButton';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { QueryState } from '@/shared/components/QueryState';
import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

const SEARCH_DELAY_MS = 300;
const statuses: HallStatus[] = ['all', 'active', 'inactive'];

export function HallsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'CompanyHalls'>) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<HallStatus>('all');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);
  const query = useHalls({ search: debouncedSearch, status });
  const items = query.data?.pages.flatMap(page => page.data) ?? [];
  const counts = query.data?.pages[0]?.meta.status_counts;
  const labels = ['Toate', 'Active', 'Inactive'];
  return (
    <Screen>
      <HallScreenHeader
        title="Săli"
        subtitle="Capacitatea și disponibilitatea spațiilor tale."
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        keyExtractor={hall => hall.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.stack}>
            <AppButton
              label="Adaugă sală"
              icon="add"
              fullWidth
              onPress={() => navigation.navigate('HallForm', {})}
            />
            <SearchField
              value={search}
              onChange={setSearch}
              label="Caută sală după nume"
              placeholder="Caută după nume…"
            />
            <AppSegmentedControl
              segments={statuses.map((value, index) => ({
                label: counts
                  ? `${labels[index]} (${counts[value]})`
                  : labels[index],
              }))}
              selectedIndex={statuses.indexOf(status)}
              onChangeIndex={index => setStatus(statuses[index])}
            />
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
              retry={() => query.refetch()}
            />
          </View>
        }
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <QueryState
              loading={false}
              empty
              emptyState={{
                icon: 'business-outline',
                title: 'Nu există săli pentru criteriile selectate',
                message: 'Adaugă o sală sau modifică filtrele.',
              }}
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <HallCard
            hall={item}
            onOpen={() =>
              navigation.navigate('HallDetails', { hallId: item.id })
            }
          />
        )}
        ListFooterComponent={
          <PaginationFooter
            hasMore={Boolean(query.hasNextPage)}
            loading={query.isFetchingNextPage}
            error={query.isFetchNextPageError ? query.error : undefined}
            onLoadMore={() => query.fetchNextPage()}
            label="Mai multe săli"
          />
        }
      />
    </Screen>
  );
}
