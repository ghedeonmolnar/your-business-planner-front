import { companyNow, formatMonthLabel } from '@/shared/utils/formatDate';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Card } from '@/shared/components/Card';
import { useOverview } from '@/features/company/hooks/useCompany';
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
    <View
      accessibilityLabel={`Rezumat pentru ${formatMonthLabel(now.format('YYYY-MM'))}`}
    >
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
            <Card key={item.label} style={summaryStyles.metric}>
              <View style={summaryStyles.icon}>
                <Ionicons
                  accessible={false}
                  name={item.icon}
                  color={theme.colors.menu.primary}
                  size={theme.typography.title}
                />
              </View>
              <View style={summaryStyles.labels}>
                <Text style={summaryStyles.label}>{item.label}</Text>
                <Text style={summaryStyles.value}>{item.value}</Text>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  metric: {
    alignItems: 'center',
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    flexGrow: 1,
    flexBasis: '45%',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  labels: { flex: 1, gap: theme.spacing.xs, minWidth: 0 },
  label: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  value: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
});
