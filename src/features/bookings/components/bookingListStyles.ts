import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const bookingListStyles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  section: { gap: theme.spacing.md },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  subtitle: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.sectionTitle,
  },
  muted: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  row: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'stretch' },
  filterField: { marginBottom: 0 },
  grow: { flex: 1 },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  monthCount: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.bodySmall,
  },
  create: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  preview: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.menu.primarySoft,
    gap: theme.spacing.xs,
  },
  previewText: { color: theme.colors.menu.text },
});
