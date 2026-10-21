import React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { EmployeeAgendaEventCard } from '@/features/employeeWorkspace/components/EmployeeAgendaEventCard';
import {
  useEmployeeAgenda,
  useEmployeeAgendaSummary,
} from '@/features/employeeWorkspace/hooks/useEmployeeWorkspace';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { isUnauthorizedError } from '@/shared/api/client';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

type MonthSection = { key: string; title: string; data: EmployeeEvent[] };

function groupEventsByMonth(events: EmployeeEvent[]): MonthSection[] {
  const currentMonth = dayjs().format('YYYY-MM');
  const currentYear = dayjs().year();
  const sections = new Map<string, MonthSection>();

  events.forEach(event => {
    const month = dayjs(event.date).format('YYYY-MM');
    const existing = sections.get(month);

    if (existing) {
      existing.data.push(event);
      return;
    }

    const label = formatMonthLabel(month);
    const title =
      month === currentMonth
        ? `Luna curentă - ${label.replace(` ${currentYear}`, '')}`
        : month.startsWith(`${currentYear}-`)
          ? label.replace(` ${currentYear}`, '')
          : label;

    sections.set(month, { key: month, title, data: [event] });
  });

  return [...sections.values()];
}

export function EmployeeAgendaScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const agendaQuery = useEmployeeAgenda();
  const summaryQuery = useEmployeeAgendaSummary();
  const events = agendaQuery.data?.pages.flatMap(page => page.items) ?? [];
  const sections = groupEventsByMonth(events);
  const error = agendaQuery.error ?? summaryQuery.error;

  const logout = () =>
    confirmAction({
      title: 'Delogare',
      message: 'Sigur dorești să te deloghezi?',
      confirmLabel: 'Da',
      cancelLabel: 'Nu',
      onConfirm: () =>
        signOut().catch(signOutError =>
          showError(signOutError, 'Nu am putut închide sesiunea.'),
        ),
    });

  return (
    <Screen>
      <SectionList
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader
              action={
                <IconButton
                  accessibilityLabel="Delogare"
                  color={theme.colors.muted}
                  icon="log-out-outline"
                  onPress={logout}
                  style={styles.logoutButton}
                />
              }
              eyebrow="Agenda"
              title="Acasă"
            />
            <View style={styles.summaryBand}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summaryQuery.data?.upcoming_events_count ?? '...'}
                </Text>
                <Text style={styles.summaryLabel}>programate</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summaryQuery.data
                    ? formatExactMoney(summaryQuery.data.projected_earnings)
                    : '...'}
                </Text>
                <Text style={styles.summaryLabel}>câștig estimat</Text>
              </View>
            </View>
            {error && !isUnauthorizedError(error) ? (
              <ErrorBanner
                message={getErrorMessage(error, 'Nu am putut încărca agenda.')}
                onRetry={() => {
                  agendaQuery.refetch();
                  summaryQuery.refetch();
                }}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          agendaQuery.isLoading || summaryQuery.isLoading ? (
            <LoadingState />
          ) : !error ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="Nu există evenimente viitoare"
              message="Evenimentele alocate vor apărea aici."
            />
          ) : null
        }
        ListFooterComponent={
          agendaQuery.isFetchingNextPage ? <LoadingState /> : null
        }
        contentContainerStyle={styles.content}
        keyExtractor={event => event.id}
        onEndReached={() => {
          if (agendaQuery.hasNextPage && !agendaQuery.isFetchingNextPage) {
            agendaQuery.fetchNextPage();
          }
        }}
        onRefresh={() => {
          agendaQuery.refetch();
          summaryQuery.refetch();
        }}
        refreshing={agendaQuery.isRefetching || summaryQuery.isRefetching}
        renderItem={({ item }) => (
          <EmployeeAgendaEventCard
            event={item}
            onDetails={event =>
              navigation.navigate('EventDetails', { eventId: event.id })
            }
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.monthHeader}>
            <Text style={styles.monthHeaderText}>{section.title}</Text>
          </View>
        )}
        sections={sections}
        stickySectionHeadersEnabled
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  header: { marginBottom: theme.spacing.lg },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  summaryBand: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  summaryItem: { flex: 1 },
  summaryDivider: {
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    width: 1,
  },
  summaryValue: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
  summaryLabel: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.xs,
  },
  monthHeader: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  monthHeaderText: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.body,
  },
});
