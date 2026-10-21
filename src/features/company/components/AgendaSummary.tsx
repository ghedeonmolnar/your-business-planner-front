import { companyNow, formatMonthLabel } from '@/shared/utils/formatDate';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { useOverview } from '@/features/company/hooks/useCompany';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

export function AgendaSummary() {
  const now = companyNow();
  const query = useOverview(
    now.startOf('month').format('YYYY-MM-DD'),
    now.endOf('month').format('YYYY-MM-DD'),
  );
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>
        {formatMonthLabel(now.format('YYYY-MM'))}
      </Text>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data ? (
        <View style={summaryStyles.grid}>
          {[
            {
              label: 'Încasări',
              value: formatExactMoney(query.data.received_amount),
            },
            {
              label: 'De încasat',
              value: formatExactMoney(query.data.balance_due),
            },
            {
              label: 'Rezervări confirmate',
              value: query.data.confirmed_count,
            },
            {
              label: 'Rezervări provizorii',
              value: query.data.tentative_count,
            },
          ].map(item => (
            <Card key={item.label} style={summaryStyles.metric}>
              <Text style={summaryStyles.value}>{item.value}</Text>
              <Text style={styles.muted}>{item.label}</Text>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  metric: { flexGrow: 1, flexBasis: '45%', gap: theme.spacing.sm },
  value: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
});
