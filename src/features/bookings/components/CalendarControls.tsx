import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CalendarPeriod } from '@/features/bookings/hooks/useCalendarNavigation';
import { CalendarSummary } from '@/features/bookings/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';
import { CalendarPeriodPicker } from '@/features/bookings/components/CalendarPeriodPicker';

type CalendarControlsProps = {
  period: CalendarPeriod;
  selected: string;
  hallId: string;
  halls: CalendarSummary['halls'];
  onPeriod: (period: CalendarPeriod) => void;
  onMove: (direction: number) => void;
  onHall: (hallId: string) => void;
  onToday: () => void;
  onSelectMonth: (month: string) => void;
};

export function CalendarControls({
  period,
  selected,
  hallId,
  halls,
  onPeriod,
  onMove,
  onHall,
  onToday,
  onSelectMonth,
}: CalendarControlsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <View style={calendarStyles.section}>
      <ContentSection
        title="Calendar săli"
        subtitle={`Vezi disponibilitatea sălilor și rezervările pe ${period === 'month' ? 'zile' : 'luni'}.`}
        size="page"
        action={
          <IconButton
            accessibilityLabel="Revino la ziua de azi"
            icon="calendar-outline"
            onPress={onToday}
          />
        }
      />
      <AppSegmentedControl
        testID="calendar-view"
        containerStyle={styles.segments}
        segmentStyle={styles.segment}
        segmentGap={0}
        inactiveBackgroundColor={theme.colors.menu.background}
        segments={[
          { label: 'Lunar', icon: 'calendar-outline' },
          { label: 'Anual', icon: 'stats-chart-outline' },
        ]}
        selectedIndex={period === 'month' ? 0 : 1}
        onChangeIndex={index => onPeriod(index === 0 ? 'month' : 'year')}
      />
      <View style={styles.period}>
        <IconButton
          accessibilityLabel="Perioada anterioară"
          icon="chevron-back"
          onPress={() => onMove(-1)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alege luna și anul"
          onPress={() => setPickerOpen(true)}
          style={styles.periodTitle}
        >
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            style={[calendarStyles.title, styles.periodText]}
          >
            {period === 'year'
              ? selected.slice(0, 4)
              : formatMonthLabel(selected.slice(0, 7))}
          </Text>
        </Pressable>
        <IconButton
          accessibilityLabel="Perioada următoare"
          icon="chevron-forward"
          onPress={() => onMove(1)}
        />
      </View>
      {pickerOpen ? (
        <CalendarPeriodPicker
          selected={selected}
          onSelect={onSelectMonth}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
      <View>
        <SearchableSelect
          testID="calendar-hall-select"
          label="Sală"
          allowClear={false}
          single
          options={[
            { id: '', name: 'Toate sălile' },
            ...halls.map(hall => ({
              id: hall.id,
              name: hall.name + (hall.is_active ? '' : ' · Arhivată'),
            })),
          ]}
          selectedValues={[hallId]}
          onChange={values => onHall(values[0] ?? '')}
          placeholder="Toate sălile"
          searchPlaceholder="Caută sala"
          noItemsText="Adaugă prima sală din Mai multe → Săli."
          icon="business-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segments: {
    borderColor: theme.colors.menu.primarySoft,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.menu.background,
    overflow: 'hidden',
  },
  segment: {
    borderWidth: 0,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
  },
  period: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm },
  periodTitle: {
    flex: 1,
    justifyContent: 'center',
    minHeight: theme.controls.fieldHeight,
  },
  periodText: { textAlign: 'center' },
});
