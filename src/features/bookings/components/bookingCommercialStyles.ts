import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const bookingCommercialStyles = StyleSheet.create({
  minimum: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  hint: {
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    lineHeight: theme.typography.subtitle,
    color: theme.colors.menu.muted,
  },
  confirmationHint: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    lineHeight: theme.typography.subtitle,
    color: theme.colors.menu.muted,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  services: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  title: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
    color: theme.colors.menu.text,
  },
  serviceCard: {
    borderWidth: 1,
    borderColor: theme.colors.menu.border,
    backgroundColor: theme.colors.menu.background,
    gap: theme.spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  serviceTitle: {
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
    color: theme.colors.menu.text,
  },
});
