import { StyleSheet } from 'react-native';
import { CalendarProps } from 'react-native-calendars';
import { calendarDayStyles } from '@/shared/components/calendarDayStyles';
import { theme } from '@/shared/theme/theme';

export const dateCalendarTheme = {
  calendarBackground: theme.colors.surface,
  selectedDayTextColor: theme.colors.surface,
  'stylesheet.day.basic': calendarDayStyles,
  textDisabledColor: theme.colors.disabled,
  todayTextColor: theme.colors.primary,
} as CalendarProps['theme'];

export const dateCalendarPanelStyles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    maxWidth: 440,
    overflow: 'hidden',
    padding: theme.spacing.md,
    width: '100%',
    ...theme.shadow,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  body: { flex: 1 },
  hiddenHeader: { display: 'none' },
  calendarBody: { paddingLeft: 0, paddingRight: 0 },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  notice: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
    marginTop: 2,
  },
  yearToggle: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 44,
    paddingHorizontal: theme.spacing.xs,
  },
  yearToggleText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
});
