import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const formModalStyles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.title,
    fontFamily: theme.fonts.heading,
    paddingRight: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  fitContent: { flex: 0, flexBasis: 'auto', flexGrow: 0, flexShrink: 1 },
  scrollContent: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  embedded: { marginHorizontal: -theme.spacing.lg },
});
