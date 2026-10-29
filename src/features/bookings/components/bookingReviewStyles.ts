import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const bookingReviewStyles = StyleSheet.create({
  content: { gap: theme.spacing.lg },
  identity: { gap: theme.spacing.sm },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
  client: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  clientName: {
    flex: 1,
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
  },
  status: { alignSelf: 'flex-start' },
  schedule: {
    backgroundColor: theme.colors.menu.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  scheduleIcon: {
    backgroundColor: theme.colors.menu.primarySoft,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.pill,
  },
  scheduleDetails: { flex: 1, gap: theme.spacing.xs },
  label: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  scheduleValue: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.title,
  },
  sectionTitle: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.menu.border,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  rowLabel: { flexGrow: 1, flexShrink: 1, flexBasis: '55%' },
  value: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.menu.border,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  total: {
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  totalLabel: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.bodySmall,
  },
  totalAmount: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
});
