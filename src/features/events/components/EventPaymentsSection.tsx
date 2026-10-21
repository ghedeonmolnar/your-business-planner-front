import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { EventPayment } from '@/features/events/types';
import { AppButton } from '@/shared/components/AppButton';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { isUnauthorizedError } from '@/shared/api/client';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { formatLongDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/money';
import { eventDetailsStyles } from '@/features/events/components/eventDetailsStyles';

const paymentTypeLabel = { incoming: 'Încasat', outgoing: 'Plătit' };
const paymentStatusLabel = {
  completed: 'Finalizată',
  pending: 'În așteptare',
  cancelled: 'Anulată',
};

type EventPaymentsSectionProps = {
  payments: EventPayment[];
  loading: boolean;
  error: unknown;
  totals: {
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    cashProfit: number;
  };
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (payment: EventPayment) => void;
  onDelete: (payment: EventPayment) => void;
};

export function EventPaymentsSection({
  payments,
  loading,
  error,
  totals,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
}: EventPaymentsSectionProps) {
  const isSettled = totals.balanceDue <= 0;
  const metrics = [
    ...(isSettled
      ? []
      : [
          {
            backgroundColor: theme.colors.orangeSoft,
            label: 'Rest plată',
            value: formatMoney(totals.balanceDue),
            valueColor: theme.colors.text,
          },
        ]),
    ...(totals.paidAmount > 0 || isSettled
      ? [
          {
            backgroundColor: theme.colors.surface,
            label: 'Încasat',
            value: formatMoney(totals.paidAmount),
            valueColor: theme.colors.success,
          },
        ]
      : []),
    {
      backgroundColor: theme.colors.surfaceMuted,
      label: 'Profit cash',
      value: formatMoney(totals.cashProfit),
      valueColor: theme.colors.text,
    },
  ];

  return (
    <>
      <View style={styles.summaryGrid}>
        {metrics.map(metric => (
          <Metric
            key={metric.label}
            backgroundColor={metric.backgroundColor}
            label={metric.label}
            value={metric.value}
            valueColor={metric.valueColor}
          />
        ))}
      </View>
      <AppButton fullWidth label="Adaugă plată" onPress={onAdd} size="large" />
      {loading ? <LoadingState /> : null}
      {error && !isUnauthorizedError(error) ? (
        <ErrorBanner
          message={getErrorMessage(error, 'Nu am putut încărca plățile.')}
          onRetry={onRetry}
        />
      ) : null}
      {payments.map(payment => (
        <Card
          key={payment.id}
          accessibilityLabel={`Editează ${paymentTypeLabel[
            payment.type
          ].toLowerCase()} de ${formatMoney(payment.amount)}`}
          onPress={() => onEdit(payment)}
          style={eventDetailsStyles.row}
        >
          <View style={eventDetailsStyles.rowMain}>
            <Text style={eventDetailsStyles.rowTitle}>
              {paymentTypeLabel[payment.type]} - {formatMoney(payment.amount)}
            </Text>
            <Text style={eventDetailsStyles.rowMeta}>
              {formatLongDate(payment.paid_at)} / {payment.category} /{' '}
              {paymentStatusLabel[payment.status]}
            </Text>
          </View>
          <EditIconButton
            accessibilityLabel="Editează plata"
            onPress={() => onEdit(payment)}
          />
          <IconButton
            accessibilityLabel="Șterge plata"
            backgroundColor={theme.colors.redSoft}
            color={theme.colors.danger}
            icon="trash-outline"
            onPress={() => onDelete(payment)}
            style={eventDetailsStyles.rowAction}
          />
        </Card>
      ))}
      {!loading && !payments.length ? (
        <Text style={eventDetailsStyles.emptyText}>
          Nu există plăți pentru eveniment.
        </Text>
      ) : null}
    </>
  );
}

function Metric({
  backgroundColor,
  label,
  value,
  valueColor,
}: {
  backgroundColor: string;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <Card style={[styles.metric, { backgroundColor }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  metric: {
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minWidth: '46%',
    padding: theme.spacing.md,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: theme.typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    marginTop: theme.spacing.xs,
  },
});
