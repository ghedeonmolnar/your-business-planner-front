import { TextStyle, ViewStyle } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const CALENDAR_DAY_SIZE = 36;
export const CALENDAR_DAY_BORDER_WIDTH = 2;
export const CALENDAR_DAY_RADIUS = CALENDAR_DAY_SIZE / 2;

export const calendarDayStyles: {
  base: ViewStyle;
  text: TextStyle;
  today: ViewStyle;
  selected: ViewStyle;
} = {
  base: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: CALENDAR_DAY_RADIUS,
    borderWidth: CALENDAR_DAY_BORDER_WIDTH,
    height: CALENDAR_DAY_SIZE,
    justifyContent: 'center',
    width: CALENDAR_DAY_SIZE,
  },
  text: {
    backgroundColor: 'transparent',
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodyLarge,
    includeFontPadding: false,
    marginTop: 0,
    textAlign: 'center',
  },
  today: { borderRadius: CALENDAR_DAY_RADIUS },
  selected: { borderRadius: CALENDAR_DAY_RADIUS },
};
