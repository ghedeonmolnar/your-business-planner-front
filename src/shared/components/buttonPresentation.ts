import { theme } from '@/shared/theme/theme';

export type AppButtonVariant =
  'primary' | 'outline' | 'soft' | 'ghost' | 'danger';
export type AppButtonSize = 'small' | 'medium' | 'large' | 'icon';

export const disabledButtonBackground = (variant: AppButtonVariant) =>
  variant === 'outline' || variant === 'ghost'
    ? theme.colors.elevation.level0
    : theme.colors.surfaceDisabled;

export const buttonPresentation = {
  primary: {
    mode: 'contained',
    iconMode: 'contained',
    backgroundColor: theme.colors.menu.primary,
    color: theme.colors.menu.surface,
  },
  outline: {
    mode: 'outlined',
    iconMode: 'outlined',
    backgroundColor: theme.colors.menu.surface,
    color: theme.colors.menu.primary,
  },
  soft: {
    mode: 'contained-tonal',
    iconMode: 'contained-tonal',
    backgroundColor: theme.colors.menu.primarySoft,
    color: theme.colors.menu.primary,
  },
  ghost: {
    mode: 'text',
    iconMode: undefined,
    backgroundColor: theme.colors.elevation.level0,
    color: theme.colors.menu.primary,
  },
  danger: {
    mode: 'contained',
    iconMode: 'contained',
    backgroundColor: theme.colors.error,
    color: theme.colors.onError,
  },
} as const;
