import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { DashboardMonthHeader } from '@/features/dashboard/components/DashboardMonthHeader';
import { groupDashboardEventsByMonth } from '@/features/dashboard/utils/dashboardMonthSections';
import { EventCard } from '@/features/events/components/EventCard';
import { useUpcomingEvents } from '@/features/events/hooks/useEvents';
import { Event } from '@/features/events/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { IconButton } from '@/shared/components/IconButton';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { isUnauthorizedError } from '@/shared/api/client';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

export function DashboardScreen() {
  const { signOut } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const summaryQuery = useDashboardSummary();
  const upcomingEventsQuery = useUpcomingEvents();
  const events = useMemo(
    () => upcomingEventsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [upcomingEventsQuery.data],
  );
  const eventSections = useMemo(
    () => groupDashboardEventsByMonth(events),
    [events],
  );
  const error = upcomingEventsQuery.error ?? summaryQuery.error;
  const summary = summaryQuery.data;

  const openDetails = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const confirmSignOut = () => {
    confirmAction({
      title: 'Delogare',
      message: 'Sigur dorești să te deloghezi din aplicație?',
      confirmLabel: 'Da',
      cancelLabel: 'Nu',
      onConfirm: () => {
        signOut().catch(signOutError => {
          showError(signOutError, 'Nu am putut închide sesiunea.', {
            source: 'sign-out',
          });
        });
      },
    });
  };

  return (
    <Screen>
      <SectionList
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <ScreenHeader
              action={
                <IconButton
                  accessibilityLabel="Delogare"
                  color={theme.colors.muted}
                  icon="log-out-outline"
                  onPress={confirmSignOut}
                  style={styles.logoutButton}
                />
              }
              eyebrow="Agenda"
              title="Acasă"
            />

            <View style={styles.summaryBand}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summary?.upcoming_events_count ?? 0}
                </Text>
                <Text style={styles.summaryLabel}>programate</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatExactMoney(summary?.projected_balance_due ?? 0)}
                </Text>
                <Text style={styles.summaryLabel}>de încasat</Text>
              </View>
            </View>

            {error && !isUnauthorizedError(error) ? (
              <ErrorBanner
                message={getErrorMessage(
                  error,
                  'Nu am putut încărca evenimentele.',
                )}
                onRetry={() => {
                  upcomingEventsQuery.refetch();
                  summaryQuery.refetch();
                }}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          upcomingEventsQuery.isLoading || summaryQuery.isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon="calendar-clear-outline"
              message="Evenimentele adăugate vor apărea aici automat."
              title="Nu există evenimente viitoare"
            />
          )
        }
        ListFooterComponent={
          upcomingEventsQuery.isFetchingNextPage ? <LoadingState /> : undefined
        }
        contentContainerStyle={styles.listContent}
        sections={eventSections}
        keyExtractor={item => item.id.toString()}
        onRefresh={() => {
          upcomingEventsQuery.refetch();
          summaryQuery.refetch();
        }}
        refreshing={
          (upcomingEventsQuery.isRefetching &&
            !upcomingEventsQuery.isFetchingNextPage) ||
          summaryQuery.isRefetching
        }
        onEndReached={() => {
          if (
            upcomingEventsQuery.hasNextPage &&
            !upcomingEventsQuery.isFetching
          ) {
            upcomingEventsQuery.fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onDetails={openDetails}
            showTypePill={false}
            showMapAction
          />
        )}
        renderSectionHeader={({ section }) => (
          <DashboardMonthHeader
            balanceDue={
              summary?.monthly_balance_due.find(
                month => month.month === section.key,
              )?.balance_due
            }
            month={section.key}
            title={section.title}
          />
        )}
        stickySectionHeadersEnabled
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerWrap: {
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 44,
    width: 44,
  },
  summaryBand: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    width: 1,
  },
  summaryValue: {
    color: theme.colors.surface,
    fontSize: theme.typography.title,
    fontWeight: '800',
  },
  summaryLabel: {
    color: theme.colors.surfaceMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.xs,
  },
});
