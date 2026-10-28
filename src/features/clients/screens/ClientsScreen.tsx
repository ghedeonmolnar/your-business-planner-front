import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { createCatalogLabelMap } from '@/features/catalogs/utils/catalogLabels';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { ClientForm } from '@/features/clients/components/ClientForm';
import { ClientFormValues } from '@/features/clients/schemas/clientSchema';
import { Client } from '@/features/clients/types';
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from '@/features/clients/hooks/useClients';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { AppButton } from '@/shared/components/AppButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { isUnauthorizedError } from '@/shared/api/client';
import { theme } from '@/shared/theme/theme';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { RootStackParamList } from '@/shared/navigation/types';

export function ClientsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const catalogsQuery = useCatalogs();
  const clientsQuery = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);

  const clients = useMemo(
    () => clientsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [clientsQuery.data],
  );
  const savedClientsCount =
    clientsQuery.data?.pages[0]?.total ?? clients.length;
  const error = clientsQuery.error ?? catalogsQuery.error;
  const sourceLabels = useMemo(
    () => createCatalogLabelMap(catalogsQuery.data?.client_sources),
    [catalogsQuery.data?.client_sources],
  );

  const openCreate = () => {
    setEditingClient(null);
    setFormVisible(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormVisible(true);
  };

  const closeForm = () => {
    setEditingClient(null);
    setFormVisible(false);
  };

  const saveClient = (values: ClientFormValues) => {
    if (editingClient) {
      updateClient.mutate(
        { id: editingClient.id, payload: values },
        {
          onSuccess: closeForm,
          onError: mutationError => {
            showError(mutationError, 'Nu am putut salva clientul.');
          },
        },
      );
      return;
    }

    createClient.mutate(values, {
      onSuccess: closeForm,
      onError: mutationError => {
        showError(mutationError, 'Nu am putut salva clientul.');
      },
    });
  };

  const loadMoreClients = () => {
    if (clientsQuery.hasNextPage && !clientsQuery.isFetchingNextPage) {
      clientsQuery.fetchNextPage();
    }
  };

  const confirmDelete = (client: Client) => {
    confirmAction({
      title: 'Confirmare',
      message: `Ștergi clientul "${client.name}"?`,
      confirmLabel: 'Șterge',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return deleteClient.mutateAsync(client.id).catch(mutationError => {
          if (actionGeneration !== getSessionGeneration()) return;
          showError(mutationError, 'Nu am putut șterge clientul.');
        });
      },
    });
  };

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <>
            <ScreenHeader
              action={
                <AppButton
                  accessibilityLabel="Adaugă client"
                  icon="add"
                  label="Client"
                  onPress={openCreate}
                  size="small"
                  variant="outline"
                />
              }
              eyebrow="CRM"
              subtitle={`${savedClientsCount} clienți în baza de date`}
              title="Clienți"
            />
            {error && !isUnauthorizedError(error) ? (
              <ErrorBanner
                message={getErrorMessage(
                  error,
                  'Nu am putut încărca clienții.',
                )}
                onRetry={() => {
                  clientsQuery.refetch();
                  catalogsQuery.refetch();
                }}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          clientsQuery.isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon="person-add-outline"
              message="Adaugă primul client ca să îl folosești în evenimente."
              title="Nu ai clienți încă"
            />
          )
        }
        ListFooterComponent={
          clientsQuery.isFetchingNextPage ? <LoadingState /> : undefined
        }
        contentContainerStyle={styles.listContent}
        data={clients}
        keyExtractor={item => item.id.toString()}
        onEndReached={loadMoreClients}
        onEndReachedThreshold={0.4}
        onRefresh={() => clientsQuery.refetch()}
        refreshing={clientsQuery.isRefetching}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onDelete={confirmDelete}
            onDetails={client =>
              navigation.navigate('ClientDetails', { clientId: client.id })
            }
            onEdit={openEdit}
            sourceLabels={sourceLabels}
          />
        )}
      />
      <ClientForm
        initialClient={editingClient}
        onCancel={closeForm}
        onSubmit={saveClient}
        saving={createClient.isPending || updateClient.isPending}
        visible={isFormVisible}
      />
      {deleteClient.isPending ? (
        <Text style={styles.pendingText}>Se șterge...</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  pendingText: {
    bottom: theme.spacing.lg,
    color: theme.colors.muted,
    fontSize: theme.typography.label,
    position: 'absolute',
    right: theme.spacing.lg,
  },
});
