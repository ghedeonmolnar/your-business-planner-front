import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const bookingClientStyles = StyleSheet.create({
  content: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  introduction: { gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  description: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    flexShrink: 1,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.menu.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  existing: { backgroundColor: theme.colors.menu.successSoft },
  existingDescription: { color: theme.colors.menu.text },
  resultContent: { flex: 1, gap: theme.spacing.xs },
  resultDescription: { lineHeight: theme.typography.subtitle },
  resultLabel: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.label,
  },
  clientName: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  note: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
});
