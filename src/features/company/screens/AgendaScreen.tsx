import { companyNow } from '@/shared/utils/formatDate';
import React from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { RootStackParamList } from '@/shared/navigation/types';
import { AgendaSummary } from '@/features/company/components/AgendaSummary';

export function AgendaScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const query = useBookings({ date_from: companyNow().format('YYYY-MM-DD') });
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.content}>
            <Text style={styles.title}>{user?.company?.name}</Text>
            <Text style={styles.subtitle}>Agenda următoarelor evenimente</Text>
            {user?.role !== 'employee' ? <AgendaSummary /> : null}
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              empty={!items.length}
              retry={() => query.refetch()}
            />
          </View>
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
              label="Încarcă mai multe"
              disabled={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
            />
          ) : null
        }
      />
    </Screen>
  );
}
