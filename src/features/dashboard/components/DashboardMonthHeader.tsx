import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';

type Props = {
  balanceDue: number | undefined;
  month: string;
  title: string;
};

export function DashboardMonthHeader({ balanceDue, month, title }: Props) {
  return (
    <View style={styles.header} testID={`dashboard-month-${month}`}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.balance}>
        <Text style={styles.value}>
          {balanceDue === undefined ? '...' : formatExactMoney(balanceDue)}
        </Text>
        <Text style={styles.label}>de încasat</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  title: {
    color: theme.colors.surface,
    flexBasis: '50%',
    flexGrow: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.body,
  },
  balance: { alignItems: 'flex-end', flexGrow: 1 },
  value: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.body,
    textAlign: 'right',
  },
  label: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    textAlign: 'right',
  },
});
