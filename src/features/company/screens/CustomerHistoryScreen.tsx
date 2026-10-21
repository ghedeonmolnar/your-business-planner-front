import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { useCustomer } from '@/features/company/hooks/useCustomers';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
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
  const customer = useCustomer(route.params.clientId);
  const [editing, setEditing] = useState(false);
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
            {customer.data ? (
              <>
                <Text style={styles.subtitle}>{customer.data.name}</Text>
                <Text style={styles.muted}>
                  {customer.data.phone || 'Telefon necompletat'}
                </Text>
                {customer.data.notes ? (
                  <Text style={styles.text}>{customer.data.notes}</Text>
                ) : null}
                <AppButton
                  label="Editează clientul"
                  icon="create-outline"
                  variant="soft"
                  onPress={() => setEditing(true)}
                />
              </>
            ) : null}
            <QueryNotice
              loading={customer.isLoading}
              error={customer.error}
              retry={() => customer.refetch()}
            />
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
          ) : undefined
        }
      />
      {editing && customer.data ? (
        <DirectoryForm
          kind="clients"
          item={customer.data}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </Screen>
  );
}
