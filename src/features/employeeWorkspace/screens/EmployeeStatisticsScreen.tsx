import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { useEmployeeStatistics } from '@/features/employeeWorkspace/hooks/useEmployeeWorkspace';
import { isUnauthorizedError } from '@/shared/api/client';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { theme } from '@/shared/theme/theme';

const MINUTES_PER_HOUR = 60;

export function EmployeeStatisticsScreen() {
  const [period, setPeriod] = useState<'month' | 'all'>('month');
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const statisticsQuery = useEmployeeStatistics(period, month);
  const statistics = statisticsQuery.data;

  const changeMonth = (months: number) => {
    setMonth(current =>
      dayjs(`${current}-01`).add(months, 'month').format('YYYY-MM'),
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Activitatea mea" title="Statistici" />
        <AppSegmentedControl
          onChangeIndex={index => setPeriod(index === 0 ? 'month' : 'all')}
          selectedIndex={period === 'month' ? 0 : 1}
          segments={[{ label: 'Luna' }, { label: 'Tot istoricul' }]}
        />
        {period === 'month' ? (
          <View style={styles.monthRow}>
            <IconButton
              accessibilityLabel="Luna precedentă"
              icon="chevron-back"
              onPress={() => changeMonth(-1)}
            />
            <Text style={styles.month}>{formatMonthLabel(month)}</Text>
            <IconButton
              accessibilityLabel="Luna următoare"
              icon="chevron-forward"
              onPress={() => changeMonth(1)}
            />
          </View>
        ) : null}
        {statisticsQuery.isLoading ? <LoadingState /> : null}
        {statisticsQuery.error &&
        !isUnauthorizedError(statisticsQuery.error) ? (
          <ErrorBanner
            message={getErrorMessage(
              statisticsQuery.error,
              'Nu am putut încărca statisticile.',
            )}
            onRetry={() => statisticsQuery.refetch()}
          />
        ) : null}
        {statistics && statistics.events_count === 0 ? (
          <EmptyState
            icon="stats-chart-outline"
            title="Fără evenimente încheiate"
            message="Statisticile vor apărea după primul eveniment."
          />
        ) : null}
        {statistics && statistics.events_count > 0 ? (
          <>
            <Card style={styles.card}>
              <Text style={styles.label}>Câștig cuvenit</Text>
              <Text style={styles.value}>
                {formatExactMoney(statistics.earnings)}
              </Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.label}>Evenimente încheiate</Text>
              <Text style={styles.value}>{statistics.events_count}</Text>
              <Text style={styles.detail}>
                Ore lucrate:{' '}
                {Math.floor(statistics.worked_minutes / MINUTES_PER_HOUR)} ore{' '}
                {statistics.worked_minutes % MINUTES_PER_HOUR} min
              </Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.label}>Colegul cel mai des întâlnit</Text>
              <Text style={styles.name}>
                {statistics.top_coworker?.name ?? 'Fără colegi'}
              </Text>
              {statistics.top_coworker ? (
                <Text style={styles.detail}>
                  {statistics.top_coworker.events_count} evenimente împreună
                </Text>
              ) : null}
            </Card>
            <Card style={styles.card}>
              <Text style={styles.label}>Costumul cel mai des purtat</Text>
              <Text style={styles.name}>
                {statistics.top_mascot?.name ?? 'Fără costum alocat'}
              </Text>
              {statistics.top_mascot ? (
                <Text style={styles.detail}>
                  {statistics.top_mascot.events_count} evenimente
                </Text>
              ) : null}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.lg,
  },
  month: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  card: { marginTop: theme.spacing.md },
  label: { color: theme.colors.muted, fontSize: theme.typography.bodySmall },
  value: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    marginTop: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.sm,
  },
  detail: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.sm,
  },
});
