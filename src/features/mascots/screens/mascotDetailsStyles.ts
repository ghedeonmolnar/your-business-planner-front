import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const mascotDetailsStyles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  navigationTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
    marginLeft: theme.spacing.md,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.orangeSoft,
    borderRadius: theme.radius.lg,
    height: 70,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    width: 70,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  titleArea: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.caption,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    lineHeight: 32,
  },
  statusBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  activeBadge: {
    backgroundColor: theme.colors.surface,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.redSoft,
  },
  statusText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.label,
  },
  activeText: {
    color: theme.colors.success,
  },
  inactiveText: {
    color: theme.colors.danger,
  },
  detailsCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodyLarge,
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    marginBottom: theme.spacing.md,
    minWidth: '50%',
    paddingRight: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.subtle,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  detailValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
  totalCard: {
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: theme.spacing.xl,
  },
  totalLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
  totalValue: {
    color: theme.colors.success,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    lineHeight: 39,
    marginTop: theme.spacing.xs,
  },
  totalHint: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    marginTop: theme.spacing.xs,
  },
  eventsTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
    marginBottom: theme.spacing.md,
  },
});
