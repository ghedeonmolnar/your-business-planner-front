import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHallDay } from '@/features/bookings/hooks/useBookings';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { QueryState } from '@/shared/components/QueryState';
import { RootStackParamList } from '@/shared/navigation/types';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatLongDate } from '@/shared/utils/formatDate';
import { CalendarDataFreshness } from '@/features/bookings/components/CalendarDataFreshness';
import { theme } from '@/shared/theme/theme';
import { DirectoryItem } from '@/features/company/types';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';

export function CalendarDayHalls({
  date,
  hallId,
  onReserve,
  active = true,
}: {
  date: string;
  hallId?: string;
  onReserve: (hall: DirectoryItem | null) => void;
  active?: boolean;
}) {
  const query = useHallDay(date, hallId, active);
  const catalogs = useCatalogs();
  const typeLabels = createCatalogLabelMap(catalogs.data?.event_types);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const halls = query.data?.pages.flatMap(page => page.items) ?? [];
  const free = halls.filter(hall => hall.status === 'free').length;
  return (
    <Card style={calendarStyles.card}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={calendarStyles.title}>
          {formatLongDate(date)}
        </Text>
        <Text style={calendarStyles.muted}>
          {query.hasNextPage
            ? 'Săli libere în lista încărcată: '
            : 'Săli libere: '}
          <Text style={calendarStyles.primary}>{query.data ? free : '—'}</Text>
        </Text>
        <CalendarDataFreshness
          label="Lista sălilor"
          updatedAt={query.dataUpdatedAt}
          fetching={query.isFetching}
          stale={query.isError || query.isStale}
        />
      </View>
      <QueryState
        loading={query.isLoading}
        hasData={halls.length > 0}
        error={query.isFetchNextPageError ? undefined : query.error}
        retry={() => query.refetch()}
      />
      <QueryState
        loading={false}
        error={catalogs.error}
        retry={() => catalogs.refetch()}
      />
      {!query.isLoading && !query.error && !halls.length ? (
        <EmptyState
          icon="business-outline"
          title="Nicio sală disponibilă"
          message="Adaugă o sală din Mai multe → Săli sau selectează o altă sală."
        />
      ) : null}
      {halls.map(hall => (
        <View key={hall.id} style={styles.header}>
          {hall.bookings?.length ? (
            hall.bookings.map(booking => (
              <CalendarHallRow
                key={booking.id}
                hall={{
                  ...hall,
                  booking_id: booking.id,
                  status: booking.status,
                  type: booking.type,
                  starts_at: booking.starts_at,
                  ends_at: booking.ends_at,
                }}
                typeLabel={getCatalogLabel(typeLabels, booking.type)}
                onPress={() =>
                  navigation.navigate('EventDetails', { eventId: booking.id })
                }
              />
            ))
          ) : (
            <CalendarHallRow
              hall={hall}
              typeLabel={getCatalogLabel(typeLabels, hall.type)}
              onPress={
                hall.status === 'inactive'
                  ? undefined
                  : () =>
                      hall.booking_id
                        ? navigation.navigate('EventDetails', {
                            eventId: hall.booking_id,
                          })
                        : onReserve({
                            id: hall.id,
                            name: hall.name,
                            capacity: hall.capacity,
                            minimum_guests: hall.minimum_guests,
                            is_active: hall.is_active ?? true,
                          })
              }
            />
          )}
        </View>
      ))}
      <PaginationFooter
        hasMore={Boolean(query.hasNextPage)}
        loading={query.isFetchingNextPage}
        error={query.isFetchNextPageError ? query.error : undefined}
        onLoadMore={() => query.fetchNextPage()}
        label="Mai multe săli"
      />
      <AppButton
        label="Rezervare nouă în această zi"
        multiline
        icon="add"
        variant="soft"
        onPress={() => onReserve(null)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.xs },
});
