import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ReportDistributionCard } from '@/features/analytics/components/ReportDistributionCard';
import { BusinessReport, ReportComparison } from '@/features/analytics/types';
import { formatPercent } from '@/features/analytics/utils/reportFormat';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';

type Props = {
  report: BusinessReport;
  comparison?: ReportComparison;
};
type Metric = { label: string; value: string };
type TeamMember = BusinessReport['team'][number];

function TeamMemberMoney({ member }: { member: TeamMember }) {
  const sharesProfit = member.profit_share_amount !== null;

  return (
    <>
      {!sharesProfit || member.cost_amount > 0 ? (
        <Text style={styles.listValue}>
          Cost: {formatExactMoney(member.cost_amount)}
        </Text>
      ) : null}
      {member.profit_share_amount !== null ? (
        <Text style={styles.listValue}>
          Parte din profit: {formatExactMoney(member.profit_share_amount)}
        </Text>
      ) : null}
    </>
  );
}

function MetricPanel({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <Card style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.metricGrid}>
        {metrics.map(metric => (
          <View key={metric.label} style={styles.metric}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function ReportSections({ report, comparison }: Props) {
  const mascotDistribution = report.mascots.map(item => ({
    label: item.mascot_name,
    count: item.events_count,
    percent:
      report.events.total === 0
        ? 0
        : Math.round((item.events_count * 1000) / report.events.total) / 10,
  }));

  return (
    <View>
      <MetricPanel
        title="Evenimente"
        metrics={[
          { label: 'Total', value: String(report.events.total) },
          { label: 'Finalizate', value: String(report.events.completed) },
          { label: 'Programate', value: String(report.events.upcoming) },
          { label: 'Anulate', value: String(report.events.cancelled) },
          {
            label: 'Rata anulărilor',
            value: `${report.events.cancellation_rate_percent}%`,
          },
          ...(comparison
            ? [
                {
                  label: 'Față de luna trecută',
                  value: formatPercent(comparison.events_change_percent),
                },
              ]
            : []),
          {
            label: 'Încasare medie',
            value:
              report.average_revenue_per_event === null
                ? '-'
                : formatExactMoney(report.average_revenue_per_event),
          },
          {
            label: 'Marjă profit',
            value:
              report.profit_margin_percent === null
                ? 'Nedisponibilă'
                : `${report.profit_margin_percent}%`,
          },
        ]}
      />
      <MetricPanel
        title="Clienți"
        metrics={[
          { label: 'Activi', value: String(report.clients.active) },
          { label: 'Noi', value: String(report.clients.new) },
          { label: 'Vechi', value: String(report.clients.returning) },
          {
            label: 'Clienți care revin',
            value: `${report.clients.returning_rate_percent}%`,
          },
        ]}
      />
      <ReportDistributionCard title="Localități" items={report.locations} />
      <ReportDistributionCard
        title="Tipuri de evenimente"
        items={report.event_types}
      />
      <ReportDistributionCard
        title="Surse clienți"
        items={report.client_sources}
      />
      <ReportDistributionCard title="Zile aglomerate" items={report.weekdays} />
      <ReportDistributionCard
        title="Mascote solicitate"
        items={mascotDistribution}
      />
      <Card style={styles.panel}>
        <Text style={styles.title}>Echipa</Text>
        {report.team.length === 0 ? (
          <Text style={styles.empty}>
            Nu există date pentru această perioadă.
          </Text>
        ) : null}
        {report.team.map(item => (
          <View key={item.employee_id} style={styles.teamRow}>
            <Text style={styles.listName}>{item.employee_name}</Text>
            <Text style={styles.teamMeta}>
              {item.events_count} evenimente · {item.worked_hours} ore
            </Text>
            {report.profit_amount === null ? null : (
              <TeamMemberMoney member={item} />
            )}
          </View>
        ))}
      </Card>
      <MetricPanel
        title="Calitate"
        metrics={[
          {
            label: `Recenzie lăsată (${report.ratings.internal_count})`,
            value:
              report.ratings.internal_average === null
                ? '-'
                : `${report.ratings.internal_average}/5`,
          },
          {
            label: `Recenzie primită (${report.ratings.client_count})`,
            value:
              report.ratings.client_average === null
                ? '-'
                : `${report.ratings.client_average}/5`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginBottom: theme.spacing.md },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metric: {
    marginBottom: theme.spacing.md,
    minWidth: '50%',
    paddingRight: theme.spacing.sm,
  },
  metricValue: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodyLarge,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.xs,
  },
  empty: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  listName: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
  listValue: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  teamRow: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingVertical: theme.spacing.md,
  },
  teamMeta: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginVertical: theme.spacing.xs,
  },
});
