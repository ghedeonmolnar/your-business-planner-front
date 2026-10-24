import React from 'react';
import { StyleSheet, View } from 'react-native';
import { companyNow, formatMonthLabel } from '@/shared/utils/formatDate';
import { useOverview } from '@/features/company/hooks/useCompany';
import { QueryState } from '@/shared/components/QueryState';
import { MetricCard } from '@/shared/components/MetricCard';
import { formatExactMoney } from '@/shared/utils/money';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';

export function AgendaSummary() {
  const now = companyNow();
  const singleColumn = useSingleColumnLayout();
  const query = useOverview(
    now.startOf('month').format('YYYY-MM-DD'),
    now.endOf('month').format('YYYY-MM-DD'),
  );
  return (
    <View
      accessibilityLabel={`Rezumat pentru ${formatMonthLabel(now.format('YYYY-MM'))}`}
    >
      <QueryState
        loading={query.isLoading}
        error={query.error}
        hasData={Boolean(query.data)}
        retry={() => query.refetch()}
      />
      {query.data ? (
        <View style={styles.grid}>
          {[
            {
              label: 'Încasări',
              value: formatExactMoney(query.data.received_amount),
              icon: 'wallet-outline' as const,
            },
            {
              label: 'De încasat',
              value: formatExactMoney(query.data.balance_due),
              icon: 'time-outline' as const,
            },
            {
              label: 'Confirmate',
              value: query.data.confirmed_count,
              icon: 'calendar-outline' as const,
            },
            {
              label: 'Provizorii',
              value: query.data.tentative_count,
              icon: 'document-text-outline' as const,
            },
          ].map(item => (
            <MetricCard
              key={item.label}
              {...item}
              style={singleColumn ? styles.full : styles.metric}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  metric: { flexBasis: '45%', flexGrow: 1 },
  full: { width: '100%' },
});
