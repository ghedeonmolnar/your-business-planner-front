import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { useCustomer } from '@/features/company/hooks/useCustomers';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { QueryState } from '@/shared/components/QueryState';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { RootStackParamList } from '@/shared/navigation/types';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';

export function CustomerHistoryScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'CustomerHistory'>) {
  const query = useBookings({ client_id: route.params.clientId });
  const customer = useCustomer(route.params.clientId);
  const catalogs = useCatalogs();
  const typeLabels = createCatalogLabelMap(catalogs.data?.event_types);
  const [editing, setEditing] = useState(false);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        ItemSeparatorComponent={ListItemSeparator}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ContentSection
              title="Istoricul clientului"
              size="page"
              leading={
                <IconButton
                  icon="arrow-back"
                  accessibilityLabel="Înapoi"
                  onPress={() => navigation.goBack()}
                />
              }
            />
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
            <QueryState
              loading={customer.isLoading}
              error={customer.error}
              retry={() => customer.refetch()}
            />
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
              empty={!items.length}
              retry={() => query.refetch()}
            />
            <QueryState
              loading={false}
              error={catalogs.error}
              retry={() => catalogs.refetch()}
            />
          </>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            eventType={getCatalogLabel(typeLabels, item.type)}
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
