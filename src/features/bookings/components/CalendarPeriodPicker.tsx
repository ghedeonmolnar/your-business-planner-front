import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { CalendarPeriodSelect } from '@/features/bookings/components/CalendarPeriodSelect';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
import { formatMonthName } from '@/shared/utils/formatDate';

const YEARS_ON_EACH_SIDE = 50;
const MONTHS_PER_YEAR = 12;

export function CalendarPeriodPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (month: string) => void;
  onClose: () => void;
}) {
  const focused = useIsFocused();
  const selectedYear = dayjs(selected).year();
  const [year, setYear] = useState(selected.slice(0, 4));
  const [month, setMonth] = useState(selected.slice(5, 7));
  const [expandedField, setExpandedField] = useState<'year' | 'month' | null>(
    null,
  );
  const years = Array.from(
    { length: YEARS_ON_EACH_SIDE * 2 + 1 },
    (_, index) => selectedYear - YEARS_ON_EACH_SIDE + index,
  ).filter(value => value >= 1 && value <= 9999);

  useEffect(() => {
    if (!focused) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (expandedField) setExpandedField(null);
        else onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [expandedField, focused, onClose]);

  return (
    <View testID="calendar-period-dropdown" style={styles.dropdown}>
      <CalendarPeriodSelect
        testID="calendar-period-year"
        label="An"
        expanded={expandedField === 'year'}
        onToggle={() =>
          setExpandedField(expandedField === 'year' ? null : 'year')
        }
        selectedValue={year}
        options={years.map(value => ({
          id: String(value),
          name: String(value),
        }))}
        onSelect={value => {
          setYear(value);
          setExpandedField(null);
        }}
      />
      <CalendarPeriodSelect
        testID="calendar-period-month"
        label="Lună"
        expanded={expandedField === 'month'}
        onToggle={() =>
          setExpandedField(expandedField === 'month' ? null : 'month')
        }
        selectedValue={month}
        options={Array.from({ length: MONTHS_PER_YEAR }, (_, index) => {
          const value = String(index + 1).padStart(2, '0');
          return { id: value, name: formatMonthName(`${year}-${value}`) };
        })}
        onSelect={value => {
          setMonth(value);
          setExpandedField(null);
        }}
      />
      <AppButton
        label="Afișează perioada"
        onPress={() => {
          onSelect(`${year}-${month}`);
          onClose();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
});
