import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { CalendarPeriod } from '@/features/bookings/hooks/useCalendarNavigation';
import { CalendarSummary } from '@/features/bookings/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { calendarStyles } from '@/features/bookings/components/calendarStyles';

type CalendarControlsProps = {
  period: CalendarPeriod;
  selected: string;
  hallId: string;
  halls: CalendarSummary['halls'];
  onPeriod: (period: CalendarPeriod) => void;
  onMove: (direction: number) => void;
  onHall: (hallId: string) => void;
  onToday: () => void;
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
}: CalendarControlsProps) {
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
            backgroundColor={theme.colors.menu.selected}
            color={theme.colors.menu.primary}
            style={styles.navigationButton}
          />
        }
      />
      <AppSegmentedControl
        segments={[
          { label: 'Lunar', icon: 'calendar-outline' },
          { label: 'Anual', icon: 'stats-chart-outline' },
        ]}
        selectedIndex={period === 'month' ? 0 : 1}
        onChangeIndex={index => onPeriod(index === 0 ? 'month' : 'year')}
        activeBackgroundColor={theme.colors.menu.primary}
        inactiveBackgroundColor={theme.colors.menu.background}
        activeColor={theme.colors.menu.surface}
        inactiveColor={theme.colors.menu.primary}
        segmentStyle={styles.segment}
      />
      <View style={styles.period}>
        <IconButton
          accessibilityLabel="Perioada anterioară"
          icon="chevron-back"
          onPress={() => onMove(-1)}
          color={theme.colors.menu.primary}
          backgroundColor={theme.colors.menu.primarySoft}
          style={styles.navigationButton}
        />
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          style={[calendarStyles.title, styles.periodTitle]}
        >
          {period === 'year'
            ? selected.slice(0, 4)
            : formatMonthLabel(selected.slice(0, 7))}
        </Text>
        <IconButton
          accessibilityLabel="Perioada următoare"
          icon="chevron-forward"
          onPress={() => onMove(1)}
          color={theme.colors.menu.primary}
          backgroundColor={theme.colors.menu.primarySoft}
          style={styles.navigationButton}
        />
      </View>
      <View>
        <SearchableSelect
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
          style={styles.hallField}
        />
        <View pointerEvents="none" style={styles.hallIcon}>
          <Ionicons
            accessible={false}
            name="business-outline"
            size={theme.typography.title}
            color={theme.colors.menu.muted}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    minHeight: theme.controls.fieldHeight,
  },
  period: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm },
  periodTitle: { flex: 1, textAlign: 'center' },
  navigationButton: {
    width: theme.spacing.xl * 2,
    height: theme.spacing.xl * 2,
  },
  hallField: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    paddingLeft: theme.spacing.xxl + theme.spacing.lg,
  },
  hallIcon: {
    position: 'absolute',
    left: theme.spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
