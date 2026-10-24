import React, { useState } from 'react';
import { SectionList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { useBookingFilters } from '@/features/bookings/hooks/useBookingFilters';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { BookingListFilters } from '@/features/bookings/components/BookingListFilters';
import { BookingAdvancedFilters } from '@/features/bookings/components/BookingAdvancedFilters';
import { BookingMonthHeader } from '@/features/bookings/components/BookingMonthHeader';
import { bookingListStyles as styles } from '@/features/bookings/components/bookingListStyles';
import {
  bookingCountLabel,
  bookingSections,
} from '@/features/bookings/utils/bookingSections';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { QueryState } from '@/shared/components/QueryState';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { ContentSection } from '@/shared/components/ContentSection';
import { ListResultsHeader } from '@/shared/components/ListResultsHeader';
import { RootStackParamList } from '@/shared/navigation/types';
import { companyNow } from '@/shared/utils/formatDate';

export function BookingsScreen() {
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const manager = user?.role !== 'employee';
  const financeEnabled = manager && hasCompanyFeature(user, 'finance');
  const filters = useBookingFilters(financeEnabled);
  const query = useBookings(filters.queryFilters);
  const halls = useDirectory('halls');
  const catalogs = useCatalogs(manager && Boolean(user?.subscription?.active));
  const typeLabels = createCatalogLabelMap(catalogs.data?.event_types);
  const loading = query.isPending || filters.searchPending;
  const bookings = loading
    ? []
    : (query.data?.pages.flatMap(page => page.items) ?? []);
  const firstPage = loading ? undefined : query.data?.pages[0];
  const sections = bookingSections(
    bookings,
    firstPage?.months ?? [],
    collapsed,
  );

  const resetFilters = () => {
    filters.resetAll();
    setCollapsed(new Set());
  };
  const toggleMonth = (month: string) =>
    setCollapsed(previous => {
      const next = new Set(previous);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });

  return (
    <Screen style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <ContentSection
              title={manager ? 'Rezervări' : 'Evenimentele mele'}
              subtitle="Toate evenimentele, cu starea și detaliile lor."
              size="page"
            />
            <BookingListFilters
              filters={filters}
              halls={halls.data?.pages.flatMap(page => page.items) ?? []}
              manager={manager}
              hallsState={{
                loading: halls.isLoading,
                error: halls.error,
                onRetry: () => halls.refetch(),
                pagination: {
                  hasMore: Boolean(halls.hasNextPage),
                  loading: halls.isFetchingNextPage,
                  error: halls.isFetchNextPageError ? halls.error : undefined,
                  onLoadMore: () => halls.fetchNextPage(),
                },
              }}
            />
            {firstPage ? (
              <ListResultsHeader
                label={bookingCountLabel(firstPage.total)}
                description="Grupate pe luni"
                onReset={
                  firstPage.total > 0 && filters.hasActiveFilters
                    ? resetFilters
                    : undefined
                }
              />
            ) : null}
            <QueryState
              loading={loading}
              hasData={bookings.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
              retry={() => query.refetch()}
              fallbackMessage="Nu am putut încărca rezervările."
            />
            <QueryState
              loading={false}
              error={catalogs.error}
              retry={() => catalogs.refetch()}
              fallbackMessage="Nu am putut încărca tipurile evenimentelor."
            />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <BookingMonthHeader
            title={section.title}
            total={section.total}
            collapsed={collapsed.has(section.key)}
            onToggle={() => toggleMonth(section.key)}
          />
        )}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            eventType={getCatalogLabel(typeLabels, item.type)}
            onOpen={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          !loading && !query.error ? (
            <EmptyState
              icon="calendar-outline"
              title="Nu există rezervări pentru criteriile selectate"
              message="Schimbă criteriile pentru a găsi alte rezervări."
              action={{ label: 'Resetează filtrele', onPress: resetFilters }}
            />
          ) : undefined
        }
        ListFooterComponent={
          !loading ? (
            <PaginationFooter
              hasMore={Boolean(query.hasNextPage)}
              loading={query.isFetchingNextPage}
              error={query.isFetchNextPageError ? query.error : undefined}
              onLoadMore={() => query.fetchNextPage()}
              label="Încarcă mai multe rezervări"
            />
          ) : undefined
        }
      />
      {manager ? (
        <View style={styles.create}>
          <AppButton
            label="Rezervare nouă"
            icon="add"
            onPress={() => setCreating(true)}
          />
        </View>
      ) : null}
      {filters.advancedOpen ? (
        <BookingAdvancedFilters
          values={filters.advanced}
          eventTypes={catalogs.data?.event_types ?? []}
          eventTypesState={{
            loading: catalogs.isLoading,
            error: catalogs.error,
            onRetry: () => catalogs.refetch(),
          }}
          financeEnabled={financeEnabled}
          onApply={filters.applyAdvanced}
          onClose={filters.closeAdvanced}
        />
      ) : null}
      {creating ? (
        <BookingForm
          date={companyNow().format('YYYY-MM-DD')}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </Screen>
  );
}
