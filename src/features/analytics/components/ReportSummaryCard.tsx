import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BusinessReport, ReportComparison } from '@/features/analytics/types';
import { formatPercent } from '@/features/analytics/utils/reportFormat';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';

type Props = {
  title: string;
  subtitle?: string;
  report: BusinessReport;
  comparison?: ReportComparison;
  children?: React.ReactNode;
};

function ChangeText({ value }: { value: number | null }) {
  return (
    <Text
      style={[
        styles.comparison,
        value !== null && (value < 0 ? styles.negative : styles.positive),
      ]}
    >
      Față de luna trecută: {formatPercent(value)}
    </Text>
  );
}

export function ReportDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function FutureSummary({ report }: { report: BusinessReport }) {
  return (
    <>
      <Text style={styles.label}>De încasat</Text>
      <Text style={styles.revenue}>
        {formatExactMoney(report.outstanding_amount)}
      </Text>
      <Text style={styles.comparison}>
        Profitul se calculează după ce au loc evenimentele.
      </Text>
      <ReportDetailRow
        label="Avansuri primite"
        value={formatExactMoney(report.advance_amount)}
      />
    </>
  );
}

function ReportedSummary({
  report,
  profit,
  comparison,
}: {
  report: BusinessReport;
  profit: number;
  comparison?: ReportComparison;
}) {
  return (
    <>
      <View style={styles.primaryRow}>
        <View style={styles.metric}>
          <Text style={styles.label}>Încasat</Text>
          <Text style={styles.revenue}>
            {formatExactMoney(report.revenue_amount)}
          </Text>
          {comparison ? (
            <ChangeText value={comparison.revenue_change_percent} />
          ) : null}
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Profit după plata angajaților</Text>
          <Text style={[styles.profit, profit < 0 && styles.negative]}>
            {formatExactMoney(profit)}
          </Text>
          {comparison ? (
            <ChangeText value={comparison.profit_change_percent} />
          ) : null}
        </View>
      </View>
      <ReportDetailRow
        label="Cost echipă"
        value={formatExactMoney(report.team_cost_amount)}
      />
      <ReportDetailRow
        label="Cost transport"
        value={formatExactMoney(report.transport_amount)}
      />
      {report.outstanding_amount > 0 ? (
        <ReportDetailRow
          label="De încasat"
          value={formatExactMoney(report.outstanding_amount)}
        />
      ) : null}
      {report.advance_amount > 0 ? (
        <ReportDetailRow
          label="Avansuri pentru evenimente viitoare"
          value={formatExactMoney(report.advance_amount)}
        />
      ) : null}
    </>
  );
}

export function ReportSummaryCard({
  title,
  subtitle,
  report,
  comparison,
  children,
}: Props) {
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, !subtitle && styles.titleSpacing]}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {report.profit_amount === null ? (
        <FutureSummary report={report} />
      ) : (
        <ReportedSummary
          comparison={comparison}
          profit={report.profit_amount}
          report={report}
        />
      )}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
  titleSpacing: { marginBottom: theme.spacing.lg },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  primaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1, minWidth: 0, paddingRight: theme.spacing.sm },
  label: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  revenue: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.xs,
  },
  profit: {
    color: theme.colors.success,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.xs,
  },
  negative: { color: theme.colors.danger },
  positive: { color: theme.colors.success },
  comparison: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    lineHeight: 17,
    marginTop: theme.spacing.sm,
  },
  detailRow: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.muted,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.meta,
    paddingRight: theme.spacing.sm,
  },
  detailValue: {
    color: theme.colors.text,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.meta,
    textAlign: 'right',
  },
});
