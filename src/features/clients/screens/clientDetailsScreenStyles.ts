import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const clientDetailsScreenStyles = StyleSheet.create({
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  navigationTitle: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  eventsTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
});
