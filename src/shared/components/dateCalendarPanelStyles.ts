import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const dateCalendarPanelStyles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    maxWidth: 440,
    overflow: 'hidden',
    padding: theme.spacing.md,
    width: '100%',
    ...theme.shadow,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  body: { flex: 1 },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  notice: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
    marginTop: 2,
  },
  yearToggle: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 44,
    paddingHorizontal: theme.spacing.xs,
  },
  yearToggleText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  arrow: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  disabledArrow: {
    backgroundColor: theme.colors.surfaceDisabled,
  },
});
