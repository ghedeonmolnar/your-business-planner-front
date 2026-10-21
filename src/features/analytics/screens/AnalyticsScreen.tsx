import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import { AnnualReportTab } from '@/features/analytics/components/AnnualReportTab';
import { MonthlyReportTab } from '@/features/analytics/components/MonthlyReportTab';
import { ReportYearSelector } from '@/features/analytics/components/ReportYearSelector';
import { useAnalyticsYearReport } from '@/features/analytics/hooks/useAnalyticsYearReport';
import { monthHasActivity } from '@/features/analytics/utils/reportActivity';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { isUnauthorizedError } from '@/shared/api/client';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { theme } from '@/shared/theme/theme';

const reportTabs = [
  { key: 'annual', label: 'Raport anual' },
  { key: 'monthly', label: 'Raport lunar' },
] as const;

type ReportTab = (typeof reportTabs)[number]['key'];

export function AnalyticsScreen() {
  const [tab, setTab] = useState<ReportTab>('annual');
  const [year, setYear] = useState(() => dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(() =>
    dayjs().format('YYYY-MM'),
  );
  const reportQuery = useAnalyticsYearReport(year);
  const isLoadingYear = reportQuery.isLoading || reportQuery.isPlaceholderData;
  const report = isLoadingYear ? undefined : reportQuery.data;
  const availableYears = reportQuery.data?.available_years ?? [year];
  const hasActivity = report?.months.some(monthHasActivity);
  const fallbackMonth =
    [...(report?.months ?? [])].reverse().find(monthHasActivity) ??
    report?.months[0];
  const month =
    report?.months.find(item => item.month === selectedMonth) ?? fallbackMonth;

  const changeYear = (nextYear: number) => {
    if (nextYear === year) {
      return;
    }
    setYear(nextYear);
    setSelectedMonth(
      nextYear === dayjs().year() ? dayjs().format('YYYY-MM') : '',
    );
  };

  const openMonth = (nextMonth: string) => {
    setSelectedMonth(nextMonth);
    setTab('monthly');
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={reportQuery.isRefetching && !isLoadingYear}
            onRefresh={() => reportQuery.refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        <ScreenHeader eyebrow="Raport" title="Statistici" />
        <AppSegmentedControl
          containerStyle={styles.tabs}
          onChangeIndex={index => setTab(reportTabs[index].key)}
          segments={reportTabs.map(item => ({ label: item.label }))}
          selectedIndex={reportTabs.findIndex(item => item.key === tab)}
          testID="report-tabs"
        />
        <ReportYearSelector
          year={year}
          availableYears={availableYears}
          onChange={changeYear}
        />
        {isLoadingYear && !reportQuery.error ? (
          <View
            accessibilityLabel="Se încarcă statisticile"
            style={styles.skeletonWrap}
          >
            <View style={styles.cardSkeleton} />
            <View style={styles.chartSkeleton} />
          </View>
        ) : null}
        {reportQuery.error && !isUnauthorizedError(reportQuery.error) ? (
          <ErrorBanner
            message={getErrorMessage(
              reportQuery.error,
              'Nu am putut încărca statisticile.',
            )}
            onRetry={() => reportQuery.refetch()}
          />
        ) : null}
        {!reportQuery.error && report && !hasActivity ? (
          <EmptyState
            icon="stats-chart-outline"
            title="Nu există date pentru acest an"
            message="Adaugă evenimente și încasări pentru a vedea evoluția business-ului."
          />
        ) : null}
        {!reportQuery.error && report && hasActivity && month ? (
          tab === 'annual' ? (
            <AnnualReportTab
              months={report.months}
              onOpenMonth={openMonth}
              selectedMonth={month.month}
              summary={report.summary}
            />
          ) : (
            <MonthlyReportTab
              month={month}
              months={report.months}
              onSelectMonth={setSelectedMonth}
            />
          )
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  tabs: { marginBottom: theme.spacing.lg },
  skeletonWrap: { marginTop: theme.spacing.md },
  cardSkeleton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    height: 172,
    marginBottom: theme.spacing.lg,
  },
  chartSkeleton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    height: 310,
  },
});
