import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const plannerStyles = StyleSheet.create({
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
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.sectionTitle,
    color: theme.colors.text,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  muted: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
    color: theme.colors.muted,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  field: { marginBottom: theme.spacing.md },
  grow: { flex: 1 },
});
