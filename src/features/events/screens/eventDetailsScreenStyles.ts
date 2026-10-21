import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const eventDetailsScreenStyles = StyleSheet.create({
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  navigationTitle: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
    marginLeft: theme.spacing.md,
  },
  navigationAction: {
    marginRight: theme.spacing.sm,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  segmentedControl: {
    marginBottom: theme.spacing.lg,
  },
});
