import React from 'react';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHallDay } from '@/features/bookings/hooks/useBookings';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { RootStackParamList } from '@/shared/navigation/types';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatLongDate } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';

export function CalendarDayHalls({
  date,
  hallId,
  free,
  onReserve,
}: {
  date: string;
  hallId?: string;
  free?: number;
  onReserve: (hallId: string) => void;
}) {
  const query = useHallDay(date, hallId);
  const catalogs = useCatalogs();
  const typeLabels = createCatalogLabelMap(catalogs.data?.event_types);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const halls = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Card style={calendarStyles.card}>
      <Text accessibilityRole="header" style={calendarStyles.title}>
        {formatLongDate(date)}
      </Text>
      <Text style={calendarStyles.muted}>
        Săli libere: <Text style={calendarStyles.primary}>{free ?? '—'}</Text>
      </Text>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      <QueryNotice
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
        <CalendarHallRow
          key={hall.id}
          hall={hall}
          typeLabel={getCatalogLabel(typeLabels, hall.type)}
          onPress={() =>
            hall.booking_id
              ? navigation.navigate('EventDetails', {
                  eventId: hall.booking_id,
                })
              : onReserve(hall.id)
          }
        />
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe săli"
          variant="outline"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
      <AppButton
        label="Rezervare nouă în această zi"
        multiline
        icon="add"
        variant="soft"
        shape="rounded"
        backgroundColor={theme.colors.menu.primarySoft}
        color={theme.colors.menu.primary}
        onPress={() => onReserve('')}
      />
    </Card>
  );
}
