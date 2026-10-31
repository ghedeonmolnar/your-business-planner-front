import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHallDay } from '@/features/bookings/hooks/useBookings';
import { CalendarHallGroup } from '@/features/bookings/components/CalendarHallGroup';
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
import { createCatalogLabelMap } from '@/features/catalogs/utils/catalogLabels';

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
  const freeHalls = halls.filter(hall => hall.status === 'free');
  const occupiedHalls = halls.filter(
    hall => hall.status !== 'free' && hall.status !== 'inactive',
  );
  const inactiveHalls = halls.filter(hall => hall.status === 'inactive');
  const openBooking = (eventId: string) =>
    navigation.navigate('EventDetails', { eventId });
  return (
    <Card style={calendarStyles.card}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={calendarStyles.title}>
          {formatLongDate(date)}
        </Text>
        <CalendarDataFreshness
          label="Lista sălilor"
          updatedAt={query.dataUpdatedAt}
          fetching={query.isFetching}
          stale={query.isError || query.fetchStatus === 'paused'}
          offline={query.fetchStatus === 'paused'}
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
      {!query.data && query.fetchStatus === 'paused' ? (
        <Text>
          Datele zilei nu sunt disponibile fără conexiune. Reconectează-te
          pentru a verifica sălile.
        </Text>
      ) : null}
      {query.isSuccess && !query.error && !halls.length ? (
        <EmptyState
          icon="business-outline"
          title="Nicio sală disponibilă"
          message="Adaugă o sală din Mai multe → Săli sau selectează o altă sală."
        />
      ) : null}
      {halls.length ? (
        <>
          <CalendarHallGroup
            title="Săli libere"
            halls={freeHalls}
            free
            typeLabels={typeLabels}
            partial={Boolean(query.hasNextPage)}
            onReserve={onReserve}
            onOpen={openBooking}
          />
          {occupiedHalls.length ? (
            <CalendarHallGroup
              title="Săli ocupate"
              halls={occupiedHalls}
              typeLabels={typeLabels}
              partial={Boolean(query.hasNextPage)}
              onReserve={onReserve}
              onOpen={openBooking}
            />
          ) : null}
          {inactiveHalls.length ? (
            <CalendarHallGroup
              title="Săli inactive"
              halls={inactiveHalls}
              typeLabels={typeLabels}
              partial={Boolean(query.hasNextPage)}
              onReserve={onReserve}
              onOpen={openBooking}
            />
          ) : null}
        </>
      ) : null}
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
