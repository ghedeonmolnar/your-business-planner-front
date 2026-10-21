import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const OPTION_ROW_HEIGHT = 50;
export const EMPTY_LIST_HEIGHT = 150;

export const selectOptionsModalStyles = StyleSheet.create({
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  backdrop: {
    backgroundColor: theme.colors.overlay,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    maxHeight: '76%',
    overflow: 'hidden',
    width: '100%',
    ...theme.shadow,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  headerCopy: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.sectionTitle,
  },
  selectionCount: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.xs,
  },
  searchField: {
    marginHorizontal: theme.spacing.lg,
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  optionRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: OPTION_ROW_HEIGHT,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  optionRowSelected: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  optionRowPressed: {
    opacity: 0.68,
  },
  optionRowDisabled: {
    backgroundColor: theme.colors.surfaceMuted,
    opacity: 0.62,
  },
  optionCopy: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  optionText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemibold,
  },
  optionTextDisabled: {
    color: theme.colors.muted,
  },
  optionDescription: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: EMPTY_LIST_HEIGHT,
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  footer: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
