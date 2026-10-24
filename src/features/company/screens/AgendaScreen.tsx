import React, { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import {
  useNavigation,
  CompositeNavigationProp,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { QueryState } from '@/shared/components/QueryState';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { AgendaHeader } from '@/features/company/components/AgendaHeader';
import { AgendaBookingCard } from '@/features/company/components/AgendaBookingCard';
import { AgendaMonthHeader } from '@/features/company/components/AgendaMonthHeader';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { buildAgendaSections } from '@/features/company/utils/agendaSections';
import { Screen } from '@/shared/components/Screen';
import { EmptyState } from '@/shared/components/EmptyState';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import {
  HomeTabParamList,
  RootStackParamList,
} from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';
import { companyNow } from '@/shared/utils/formatDate';

type AgendaNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function AgendaScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<AgendaNavigation>();
  const [creating, setCreating] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(
    new Set(),
  );
  const query = useBookings({ agenda: 'upcoming' });
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  const { nextBooking, sections } = buildAgendaSections(items, collapsedMonths);
  const showFinance =
    user?.role !== 'employee' && hasCompanyFeature(user, 'finance');

  const toggleMonth = (key: string) => {
    setCollapsedMonths(previous => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Screen style={styles.screen}>
      <SectionList
        sections={sections}
        ItemSeparatorComponent={ListItemSeparator}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <AgendaHeader
              onCreate={() => setCreating(true)}
              onOpenCalendar={() => navigation.navigate('Calendar')}
            />
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
              retry={() => query.refetch()}
            />
            {nextBooking ? (
              <AgendaBookingCard
                booking={nextBooking}
                featured
                showFinance={showFinance}
                onOpen={() =>
                  navigation.navigate('EventDetails', {
                    eventId: nextBooking.id,
                  })
                }
              />
            ) : !query.isLoading && !query.error ? (
              <EmptyState
                icon="calendar-clear-outline"
                title={
                  query.hasNextPage
                    ? 'Niciun eveniment activ în această pagină'
                    : 'Agenda este liberă'
                }
                message={
                  query.hasNextPage
                    ? 'Încarcă mai multe rezervări pentru a vedea următoarele evenimente.'
                    : 'Rezervările viitoare vor apărea aici, în ordinea datei.'
                }
              />
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <AgendaMonthHeader
            title={section.title}
            count={section.count}
            expanded={!collapsedMonths.has(section.key)}
            onToggle={() => toggleMonth(section.key)}
          />
        )}
        renderItem={({ item, index, section }) => (
          <AgendaBookingCard
            booking={item}
            first={index === 0}
            last={index === section.data.length - 1}
            showFinance={showFinance}
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
            hint="Numărul evenimentelor reflectă rezervările încărcate."
          />
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

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  header: { gap: theme.spacing.sm },
});
