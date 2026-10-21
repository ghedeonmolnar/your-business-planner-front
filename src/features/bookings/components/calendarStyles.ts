import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const calendarStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 0,
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
  text: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.body,
  },
  muted: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  primary: { color: theme.colors.menu.primary },
  section: { gap: theme.spacing.md },
});
