import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const eventsScreenStyles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  pendingText: {
    bottom: theme.spacing.lg,
    color: theme.colors.muted,
    fontSize: theme.typography.label,
    position: 'absolute',
    right: theme.spacing.lg,
  },
  segmentedControl: {
    marginBottom: theme.spacing.lg,
  },
});
