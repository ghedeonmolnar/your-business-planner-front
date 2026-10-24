import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHall } from '@/features/halls/hooks/useHalls';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { Screen } from '@/shared/components/Screen';
import { QueryState } from '@/shared/components/QueryState';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { RootStackParamList } from '@/shared/navigation/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';

export function HallBookingsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'HallBookings'>) {
  const hall = useHall(route.params.hallId);
  const [showHistory, setShowHistory] = useState(false);
  const query = useBookings({
    hall_id: route.params.hallId,
    agenda: showHistory ? undefined : 'upcoming',
    timeframe: showHistory ? 'all' : 'upcoming',
    sort: showHistory ? 'date_desc' : 'date_asc',
  });
  const catalogs = useCatalogs();
  const labels = createCatalogLabelMap(catalogs.data?.event_types);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <HallScreenHeader
        title="Rezervările sălii"
        subtitle={hall.data?.name}
        onBack={() => navigation.goBack()}
      />
      <AppSegmentedControl
        segments={[{ label: 'Viitoare' }, { label: 'Toate · istoric' }]}
        selectedIndex={showHistory ? 1 : 0}
        onChangeIndex={index => setShowHistory(index === 1)}
      />
      <FlatList
        data={items}
        keyExtractor={booking => booking.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <QueryState
            loading={query.isLoading}
            error={query.isFetchNextPageError ? undefined : query.error}
            hasData={items.length > 0}
            retry={() => query.refetch()}
          />
        }
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <QueryState
              loading={false}
              empty
              emptyState={{
                icon: 'calendar-outline',
                title: showHistory
                  ? 'Nu există rezervări'
                  : 'Nu există rezervări viitoare',
                message: 'Rezervările acestei săli vor apărea aici.',
              }}
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            eventType={getCatalogLabel(labels, item.type)}
            onOpen={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
          />
        )}
        ListFooterComponent={
          <PaginationFooter
            hasMore={Boolean(query.hasNextPage)}
            loading={query.isFetchingNextPage}
            error={query.isFetchNextPageError ? query.error : undefined}
            onLoadMore={() => query.fetchNextPage()}
            label="Mai multe rezervări"
          />
        }
      />
    </Screen>
  );
}
