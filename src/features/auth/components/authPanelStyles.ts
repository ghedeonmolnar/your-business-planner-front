import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const authPanelStyles = StyleSheet.create({
  formPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.xl,
    ...theme.shadow,
  },
  panelTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.title,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
});
