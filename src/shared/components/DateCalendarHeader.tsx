import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel } from '@/shared/utils/formatDate';

type DateCalendarHeaderProps = {
  month: string;
  onChangeMonth: (direction: -1 | 1) => void;
  disableArrowLeft?: boolean;
  disableArrowRight?: boolean;
};

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function DateCalendarHeader({
  month,
  onChangeMonth,
  disableArrowLeft,
  disableArrowRight,
}: DateCalendarHeaderProps) {
  const previousMonth = () => {
    if (disableArrowLeft) return;
    onChangeMonth(-1);
  };
  const nextMonth = () => {
    if (disableArrowRight) return;
    onChangeMonth(1);
  };
  return (
    <View>
      <View style={styles.navigation}>
        <IconButton
          accessibilityLabel="Luna anterioară"
          icon="chevron-back"
          variant="primary"
          disabled={disableArrowLeft}
          onPress={previousMonth}
        />
        <Text accessibilityRole="header" style={styles.month}>
          {formatMonthLabel(month.slice(0, 7))}
        </Text>
        <IconButton
          accessibilityLabel="Luna următoare"
          icon="chevron-forward"
          variant="primary"
          disabled={disableArrowRight}
          onPress={nextMonth}
        />
      </View>
      <View
        style={styles.weekdays}
        importantForAccessibility="no-hide-descendants"
      >
        {WEEKDAY_LABELS.map((label, weekday) => (
          <Text key={weekday} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  month: {
    flex: 1,
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
    textAlign: 'center',
  },
  weekdays: { flexDirection: 'row', paddingVertical: theme.spacing.sm },
  weekday: {
    flex: 1,
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.label,
    textAlign: 'center',
  },
});
