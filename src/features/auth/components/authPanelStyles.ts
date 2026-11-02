import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const authPanelStyles = StyleSheet.create({
  panel: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  panelTitle: {
    fontSize: theme.typography.sectionTitle,
    marginBottom: theme.spacing.sm,
  },
  submit: { marginTop: theme.spacing.sm },
  linkButton: { marginTop: theme.spacing.sm, alignSelf: 'center' },
  forgotLink: { alignSelf: 'flex-end', marginTop: -theme.spacing.md },
  linkRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  muted: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  invitation: { gap: theme.spacing.lg },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  line: { backgroundColor: theme.colors.border, height: 1, flex: 1 },
  dividerText: { flexShrink: 1, textAlign: 'center' },
  outlineButton: { borderColor: theme.colors.primary },
});
