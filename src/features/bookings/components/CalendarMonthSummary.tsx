import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
  MonthStatistics,
  bookingComparison,
} from '@/features/bookings/utils/calendarStatistics';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { AppButton } from '@/shared/components/AppButton';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { IconName } from '@/shared/types/icon';

export function CalendarMonthSummary({
  statistics,
  previous,
  onOpen,
}: {
  statistics: MonthStatistics;
  previous: MonthStatistics;
  onOpen: () => void;
}) {
  const singleColumn = useSingleColumnLayout();
  const items: {
    label: string;
    value: string;
    caption: string;
    icon: IconName;
  }[] = [
    {
      label: 'Rezervări totale',
      value: statistics.complete ? String(statistics.bookings) : '—',
      caption: bookingComparison(statistics, previous),
      icon: 'calendar-outline',
    },
    {
      label: 'Weekenduri ocupate',
      value:
        statistics.complete && statistics.hasHalls
          ? `${statistics.occupiedWeekends}/${statistics.weekends}`
          : '—',
      caption:
        statistics.weekends && statistics.hasHalls
          ? `${Math.round((statistics.occupiedWeekends / statistics.weekends) * 100)}% dintre weekenduri`
          : 'Nicio sală disponibilă',
      icon: 'calendar-clear-outline',
    },
    {
      label: 'Zile complet libere',
      value:
        statistics.complete && statistics.hasHalls
          ? String(statistics.freeDays)
          : '—',
      caption: `Din ${statistics.totalDays} de zile`,
      icon: 'sunny-outline',
    },
  ];
  return (
    <Card style={calendarStyles.card}>
      <Text accessibilityRole="header" style={calendarStyles.title}>
        {formatMonthLabel(statistics.month)}
      </Text>
      <View style={singleColumn ? styles.column : styles.row}>
        {items.map(item => (
          <View
            key={item.label}
            style={[styles.metric, singleColumn ? undefined : styles.flex]}
          >
            <IconBadge icon={item.icon} />
            <View style={styles.description}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.caption}>{item.caption}</Text>
            </View>
          </View>
        ))}
      </View>
      <AppButton
        label="Vezi luna"
        icon="calendar-outline"
        shape="rounded"
        backgroundColor={theme.colors.menu.primary}
        color={theme.colors.menu.surface}
        onPress={onOpen}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  column: { gap: theme.spacing.md },
  metric: { gap: theme.spacing.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
  description: { gap: theme.spacing.xs },
  label: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
  },
  value: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
  caption: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
  },
});
