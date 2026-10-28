import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  MonthStatistics,
  bookingComparison,
} from '@/features/bookings/utils/calendarStatistics';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { AppButton } from '@/shared/components/AppButton';
import { ContentSection } from '@/shared/components/ContentSection';
import { MetricCard } from '@/shared/components/MetricCard';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { IconName } from '@/shared/types/icon';

export function CalendarMonthSummary({
  statistics,
  previous,
  sameMonthLastYear,
  onOpen,
}: {
  statistics: MonthStatistics;
  previous: MonthStatistics;
  sameMonthLastYear?: MonthStatistics;
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
      caption: bookingComparison(statistics, previous, sameMonthLastYear),
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
  ];
  return (
    <View style={calendarStyles.section}>
      <ContentSection title={formatMonthLabel(statistics.month)} />
      <View style={[styles.metrics, singleColumn ? styles.column : undefined]}>
        {items.map(item => (
          <MetricCard
            key={item.label}
            {...item}
            layout="vertical"
            style={singleColumn ? styles.full : styles.metric}
          />
        ))}
      </View>
      <AppButton label="Vezi luna" icon="calendar-outline" onPress={onOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
  },
  column: { flexDirection: 'column' },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: theme.spacing.sm },
  full: { width: '100%' },
});
