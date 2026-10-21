import { StyleSheet } from 'react-native';
import { APP_ICON_BUTTON_SIZE } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

const contactActionsWidth = APP_ICON_BUTTON_SIZE * 2 + theme.spacing.xs;

export const eventCardStyles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  compactCard: {
    paddingHorizontal: theme.spacing.md,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
    paddingTop: theme.spacing.xs,
  },
  cardMainWithActions: {
    marginRight: theme.spacing.xs,
  },
  eventInfo: {
    flexShrink: 1,
  },
  titleRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  name: {
    color: theme.colors.text,
    flexShrink: 1,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
  address: {
    color: theme.colors.muted,
    flexShrink: 1,
    fontSize: theme.typography.label,
    marginLeft: theme.spacing.xs,
  },
  dateText: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
    rowGap: theme.spacing.xs,
  },
  metaPill: {
    marginTop: 0,
  },
  mascotPill: {
    flexShrink: 1,
  },
  contactActions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    width: contactActionsWidth,
  },
  footerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  metaMain: {
    flex: 1,
    minWidth: 0,
  },
  footerActions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
});
