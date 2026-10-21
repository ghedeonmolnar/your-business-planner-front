import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { companyNow } from '@/shared/utils/formatDate';
import React, { useState } from 'react';
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
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { EmptyState } from '@/shared/components/EmptyState';

export function AgendaScreen() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
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
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{user?.company?.name}</Text>
            <Text style={styles.title}>Bună, {user?.name.split(' ')[0]}!</Text>
            <Text style={styles.muted}>
              Rezervările și încasările tale, într-un singur loc.
            </Text>
            {user?.role !== 'employee' ? (
              <AppButton
                icon="add"
                label="Rezervare nouă"
                onPress={() => setCreating(true)}
              />
            ) : null}
            {user?.role !== 'employee' && hasCompanyFeature(user, 'finance') ? (
              <AgendaSummary />
            ) : null}
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              retry={() => query.refetch()}
            />
            <Text style={styles.subtitle}>Urmează în agendă</Text>
          </View>
        }
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="Agenda este liberă"
              message="Rezervările viitoare vor apărea aici, în ordinea datei."
            />
          ) : null
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
          ) : undefined
        }
      />
      {creating ? (
        <BookingForm
          date={companyNow().format('YYYY-MM-DD')}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </Screen>
  );
}
