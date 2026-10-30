import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { createCatalogLabelMap } from '@/features/catalogs/utils/catalogLabels';
import { ClientDetailsHeader } from '@/features/clients/components/ClientDetailsHeader';
import { ClientForm } from '@/features/clients/components/ClientForm';
import {
  useClient,
  useClientEvents,
  useDeleteClient,
  useUpdateClient,
} from '@/features/clients/hooks/useClients';
import { ClientFormValues } from '@/features/clients/schemas/clientSchema';
import { clientDetailsScreenStyles as styles } from '@/features/clients/screens/clientDetailsScreenStyles';
import { EventCard } from '@/features/events/components/EventCard';
import { EventTimeframe } from '@/features/events/types';
import { isUnauthorizedError } from '@/shared/api/client';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { RootStackParamList } from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetails'>;

export function ClientDetailsScreen({ navigation, route }: Props) {
  const clientId = route.params.clientId;
  const clientQuery = useClient(clientId, true);
  const client = clientQuery.data;
  const catalogsQuery = useCatalogs();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const [formVisible, setFormVisible] = useState(false);
  const [timeframe, setTimeframe] = useState<EventTimeframe>('all');
  const eventsQuery = useClientEvents(clientId, timeframe, Boolean(client));
  const events = eventsQuery.data?.pages.flatMap(page => page.items) ?? [];
  const eventsCount = eventsQuery.data?.pages[0]?.total;
  const sourceLabels = createCatalogLabelMap(
    catalogsQuery.data?.client_sources,
  );
  const typeLabels = createCatalogLabelMap(catalogsQuery.data?.event_types);
  const saving = updateClient.isPending || deleteClient.isPending;

  const saveClient = (values: ClientFormValues) => {
    if (saving) return;
    updateClient.mutate(
      { id: clientId, payload: values },
      {
        onSuccess: () => setFormVisible(false),
        onError: error => showError(error, 'Nu am putut salva clientul.'),
      },
    );
  };

  const confirmDelete = () => {
    if (!client || saving) return;
    confirmAction({
      destructive: true,
      title: 'Ștergi clientul?',
      message: `Ștergi clientul „${client.name}”? Evenimentele lui se păstrează.`,
      confirmLabel: 'Șterge',
      onConfirm: async () => {
        try {
          await deleteClient.mutateAsync(clientId);
          navigation.goBack();
        } catch (error) {
          showError(error, 'Nu am putut șterge clientul.');
        }
      },
    });
  };

  const refresh = () => {
    clientQuery.refetch();
    catalogsQuery.refetch();
    if (client) eventsQuery.refetch();
  };

  const loadMore = () => {
    if (eventsQuery.hasNextPage && !eventsQuery.isFetchingNextPage) {
      eventsQuery.fetchNextPage();
    }
  };

  return (
    <Screen>
      <View style={styles.navigationRow}>
        <IconButton
          accessibilityLabel="Înapoi la clienți"
          icon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text accessibilityRole="header" style={styles.navigationTitle}>
          Detalii client
        </Text>
        {client ? (
          <>
            <EditIconButton
              accessibilityLabel="Editează clientul"
              disabled={saving}
              onPress={() => setFormVisible(true)}
            />
            <IconButton
              accessibilityLabel="Șterge clientul"
              backgroundColor={theme.colors.redSoft}
              color={theme.colors.danger}
              disabled={saving}
              icon="trash-outline"
              onPress={confirmDelete}
            />
          </>
        ) : null}
      </View>
      <FlatList
        ListHeaderComponent={
          <>
            {clientQuery.isLoading ? <LoadingState /> : null}
            {clientQuery.error && !isUnauthorizedError(clientQuery.error) ? (
              <ErrorBanner
                message={getErrorMessage(
                  clientQuery.error,
                  'Nu am putut încărca clientul.',
                )}
                onRetry={() => clientQuery.refetch()}
              />
            ) : null}
            {client ? (
              <>
                {catalogsQuery.error &&
                !isUnauthorizedError(catalogsQuery.error) ? (
                  <ErrorBanner
                    message={getErrorMessage(
                      catalogsQuery.error,
                      'Nu am putut încărca etichetele.',
                    )}
                    onRetry={() => catalogsQuery.refetch()}
                  />
                ) : null}
                <ClientDetailsHeader
                  client={client}
                  eventsCount={eventsCount}
                  onTimeframeChange={setTimeframe}
                  sourceLabel={
                    client.source
                      ? (sourceLabels.get(client.source) ?? client.source)
                      : 'Sursă necompletată'
                  }
                  timeframe={timeframe}
                />
                {eventsQuery.error &&
                !isUnauthorizedError(eventsQuery.error) ? (
                  <ErrorBanner
                    message={getErrorMessage(
                      eventsQuery.error,
                      'Nu am putut încărca evenimentele clientului.',
                    )}
                    onRetry={() => eventsQuery.refetch()}
                  />
                ) : null}
              </>
            ) : null}
          </>
        }
        ListEmptyComponent={
          client ? (
            eventsQuery.isLoading ? (
              <LoadingState />
            ) : eventsQuery.error ? undefined : (
              <EmptyState
                icon="calendar-outline"
                message="Evenimentele clientului vor apărea aici, în funcție de filtrul ales."
                title="Nu există evenimente"
              />
            )
          ) : undefined
        }
        ListFooterComponent={
          eventsQuery.isFetchingNextPage ? <LoadingState /> : undefined
        }
        contentContainerStyle={styles.list}
        data={client ? events : []}
        keyExtractor={event => event.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        onRefresh={refresh}
        refreshing={clientQuery.isRefetching || eventsQuery.isRefetching}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onDetails={event =>
              navigation.navigate('EventDetails', { eventId: event.id })
            }
            showMapAction
            typeLabel={typeLabels.get(item.type) ?? item.type}
          />
        )}
      />
      <ClientForm
        initialClient={client}
        onCancel={() => setFormVisible(false)}
        onSubmit={saveClient}
        saving={saving}
        visible={formVisible}
      />
    </Screen>
  );
}
