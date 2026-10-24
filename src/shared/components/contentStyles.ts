import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const contentStyles = StyleSheet.create({
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  section: { gap: theme.spacing.md },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  eyebrow: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.label,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    color: theme.colors.menu.text,
  },
  subtitle: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.sectionTitle,
    color: theme.colors.menu.text,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
    color: theme.colors.menu.text,
  },
  muted: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
    color: theme.colors.menu.muted,
  },
  card: { gap: theme.spacing.sm },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  field: { marginBottom: theme.spacing.md },
  grow: { flex: 1 },
});
