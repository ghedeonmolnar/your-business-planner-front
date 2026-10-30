import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { useAgendaItems } from '@/features/company/hooks/useAgendaSummary';
import { AgendaDetailCard } from '@/features/company/components/AgendaDetailCard';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { Screen } from '@/shared/components/Screen';
import { QueryState } from '@/shared/components/QueryState';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';

const presentations = {
  events: {
    title: 'Evenimentele lunii',
    empty: 'Niciun eveniment în această lună',
    message:
      'Aici apar evenimentele confirmate și finalizate, fără anulări sau rezervări în așteptarea avansului.',
  },
  attention: {
    title: 'De rezolvat',
    empty: 'Totul este la zi',
    message:
      'Nu există termene depășite sau meniuri finale care trebuie confirmate acum.',
  },
  received: {
    title: 'Încasările lunii',
    empty: 'Nicio încasare în această lună',
    message:
      'Aici apar banii primiți efectiv, inclusiv avansurile pentru evenimente viitoare.',
  },
  due: {
    title: 'Scadent în 7 zile',
    empty: 'Nicio plată scadentă în următoarele 7 zile',
    message:
      'Avansurile convenite și încasările planificate cu termen în acest interval vor apărea aici.',
  },
};

export function AgendaDetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AgendaDetails'>) {
  const { view, month } = route.params;
  const { user } = useAuth();
  const query = useAgendaItems(view, month);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  const presentation = presentations[view];
  const subtitle =
    view === 'events' || view === 'received'
      ? formatMonthLabel(month)
      : view === 'attention'
        ? 'În ordinea termenelor · cele mai vechi primele'
        : 'Șapte zile, începând de azi';
  if (
    (view === 'received' || view === 'due') &&
    !hasCompanyFeature(user, 'finance')
  ) {
    return (
      <Screen>
        <HallScreenHeader
          title={presentation.title}
          onBack={() => navigation.goBack()}
        />
        <EmptyState
          icon="lock-closed-outline"
          title="Modul financiar indisponibil"
          message="Încasările și scadențele sunt disponibile cu modulul financiar activ."
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <HallScreenHeader
        title={presentation.title}
        subtitle={subtitle}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        keyExtractor={item => `${item.kind}:${item.id}`}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <QueryState
            loading={query.isLoading}
            hasData={items.length > 0}
            error={query.isFetchNextPageError ? undefined : query.error}
            retry={() => query.refetch()}
          />
        }
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title={presentation.empty}
              message={presentation.message}
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <AgendaDetailCard
            item={item}
            onOpen={() =>
              navigation.navigate('EventDetails', { eventId: item.event_id })
            }
          />
        )}
        ListFooterComponent={
          <PaginationFooter
            hasMore={Boolean(query.hasNextPage)}
            loading={query.isFetchingNextPage}
            error={query.isFetchNextPageError ? query.error : undefined}
            onLoadMore={() => query.fetchNextPage()}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
});
