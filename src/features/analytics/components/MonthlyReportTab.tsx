import React from 'react';
import { AnnualLineChart } from '@/features/analytics/components/AnnualLineChart';
import { ReportSections } from '@/features/analytics/components/ReportSections';
import { ReportSummaryCard } from '@/features/analytics/components/ReportSummaryCard';
import { MonthlyBusinessReport } from '@/features/analytics/types';
import { formatReportMonth } from '@/features/analytics/utils/reportFormat';

type Props = {
  month: MonthlyBusinessReport;
  months: MonthlyBusinessReport[];
  onSelectMonth: (month: string) => void;
};

export function MonthlyReportTab({ month, months, onSelectMonth }: Props) {
  return (
    <>
      <ReportSummaryCard
        comparison={month.comparison}
        report={month}
        title={formatReportMonth(month.month)}
      />
      <AnnualLineChart
        months={months}
        onSelect={onSelectMonth}
        selectedMonth={month.month}
      />
      <ReportSections comparison={month.comparison} report={month} />
    </>
  );
}
