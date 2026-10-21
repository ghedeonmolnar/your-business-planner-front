import React from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { RootStackParamList } from '@/shared/navigation/types';

export function CustomerHistoryScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'CustomerHistory'>) {
  const query = useBookings({ client_id: route.params.clientId });
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <AppButton
              label="Înapoi"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.title}>Istoricul clientului</Text>
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              empty={!items.length}
              retry={() => query.refetch()}
            />
          </>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onOpen={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
          />
        )}
        ListFooterComponent={
          query.hasNextPage ? (
            <AppButton
              label="Mai multe rezervări"
              disabled={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
            />
          ) : null
        }
      />
    </Screen>
  );
}
