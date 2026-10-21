import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AnnualLineChart } from '@/features/analytics/components/AnnualLineChart';
import { ReportSections } from '@/features/analytics/components/ReportSections';
import {
  ReportDetailRow,
  ReportSummaryCard,
} from '@/features/analytics/components/ReportSummaryCard';
import {
  AnnualBusinessSummary,
  MonthlyBusinessReport,
} from '@/features/analytics/types';
import {
  formatAnnualPeriod,
  formatReportMonth,
} from '@/features/analytics/utils/reportFormat';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';

type Props = {
  summary: AnnualBusinessSummary;
  months: MonthlyBusinessReport[];
  selectedMonth: string;
  onOpenMonth: (month: string) => void;
};

const eventsLabel = (count: number) =>
  count === 1 ? '1 eveniment' : `${count} evenimente`;

export function AnnualReportTab({
  summary,
  months,
  selectedMonth,
  onOpenMonth,
}: Props) {
  return (
    <>
      <ReportSummaryCard
        report={summary}
        subtitle={formatAnnualPeriod(summary.year)}
        title={`Anul ${summary.year}`}
      >
        {summary.best_month ? (
          <ReportDetailRow
            label="Cea mai bună lună"
            value={`${formatReportMonth(summary.best_month.month)} · ${formatExactMoney(summary.best_month.revenue_amount)}`}
          />
        ) : null}
        {summary.busiest_month ? (
          <ReportDetailRow
            label="Cea mai aglomerată lună"
            value={`${formatReportMonth(summary.busiest_month.month)} · ${eventsLabel(summary.busiest_month.events_count)}`}
          />
        ) : null}
      </ReportSummaryCard>
      <Text style={styles.chartHint}>
        Apasă pe o lună din grafic pentru raportul ei detaliat.
      </Text>
      <AnnualLineChart
        months={months}
        onSelect={onOpenMonth}
        selectedMonth={selectedMonth}
      />
      <ReportSections report={summary} />
    </>
  );
}

const styles = StyleSheet.create({
  chartHint: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginBottom: theme.spacing.sm,
  },
});
