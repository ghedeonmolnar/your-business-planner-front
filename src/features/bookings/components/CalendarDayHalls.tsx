import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHallDay } from '@/features/bookings/hooks/useBookings';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { RootStackParamList } from '@/shared/navigation/types';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';

export function CalendarDayHalls({
  date,
  hallId,
  onReserve,
}: {
  date: string;
  hallId?: string;
  onReserve: (hallId: string) => void;
}) {
  const query = useHallDay(date, hallId);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const halls = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <View style={styles.section}>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {!query.isLoading && !query.error && !halls.length ? (
        <EmptyState
          icon="business-outline"
          title="Nicio sală disponibilă"
          message="Adaugă o sală din Mai multe → Săli sau selectează o altă sală."
        />
      ) : null}
      {halls.map(hall => (
        <Card key={hall.id} style={styles.card}>
          <Text style={styles.subtitle}>{hall.name}</Text>
          <Text style={styles.muted}>
            {hall.capacity} persoane ·{' '}
            {hall.status === 'free'
              ? 'Liberă'
              : bookingStatusLabels[hall.status]}
          </Text>
          <AppButton
            label={hall.booking_id ? 'Deschide rezervarea' : 'Rezervă sala'}
            variant={hall.booking_id ? 'outline' : 'primary'}
            onPress={() =>
              hall.booking_id
                ? navigation.navigate('EventDetails', {
                    eventId: hall.booking_id,
                  })
                : onReserve(hall.id)
            }
          />
        </Card>
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe săli"
          variant="outline"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
    </View>
  );
}
