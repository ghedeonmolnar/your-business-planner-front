import { companyNow } from '@/shared/utils/formatDate';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { RootStackParamList } from '@/shared/navigation/types';

export function BookingsScreen() {
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const query = useBookings(status ? { status } : {});
  const bookings = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              {user?.role === 'employee' ? 'Evenimentele mele' : 'Rezervări'}
            </Text>
            <Text style={styles.muted}>
              Toate evenimentele, cu starea și detaliile lor.
            </Text>
            {user?.role !== 'employee' ? (
              <AppButton
                label="Rezervare nouă"
                onPress={() => setCreating(true)}
              />
            ) : null}
            <SearchableSelect
              label="Stare rezervare"
              single
              allowClear
              selectedValues={status ? [status] : []}
              options={Object.entries(bookingStatusLabels).map(
                ([id, name]) => ({ id, name }),
              )}
              onChange={values => setStatus(values[0] ?? '')}
              placeholder="Toate stările"
              searchPlaceholder="Caută stare"
              noItemsText="Nu există stări"
            />
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              empty={!bookings.length}
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
