import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const clientDetailsStyles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
  label: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.meta,
    marginBottom: theme.spacing.xs,
  },
  value: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  entry: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
