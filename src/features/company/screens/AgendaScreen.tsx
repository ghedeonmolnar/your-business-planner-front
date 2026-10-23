import React, { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
  useNavigation,
  CompositeNavigationProp,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { AgendaHeader } from '@/features/company/components/AgendaHeader';
import { AgendaBookingCard } from '@/features/company/components/AgendaBookingCard';
import { AgendaMonthHeader } from '@/features/company/components/AgendaMonthHeader';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { buildAgendaSections } from '@/features/company/utils/agendaSections';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
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
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
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
          query.hasNextPage ? (
            <View style={styles.pagination}>
              <Text style={styles.paginationHint}>
                Numărul evenimentelor reflectă rezervările încărcate.
              </Text>
              <AppButton
                label="Încarcă mai multe"
                disabled={query.isFetchingNextPage}
                onPress={() => query.fetchNextPage()}
                backgroundColor={theme.colors.menu.primarySoft}
                color={theme.colors.menu.primary}
                variant="soft"
              />
            </View>
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

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  header: { gap: theme.spacing.sm },
  pagination: { gap: theme.spacing.sm, paddingTop: theme.spacing.lg },
  paginationHint: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
});
