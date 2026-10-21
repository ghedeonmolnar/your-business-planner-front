import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const eventDetailsStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  rowMain: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  rowMeta: {
    color: theme.colors.muted,
    fontSize: theme.typography.label,
    lineHeight: 18,
    marginTop: theme.spacing.xs,
  },
  rowAction: {
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.md,
  },
});
