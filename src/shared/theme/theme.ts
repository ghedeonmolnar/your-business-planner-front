import { configureFonts, MD3LightTheme } from 'react-native-paper';

export const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: { fontFamily: 'Inter-Regular' } }),
};

export const theme = {
  colors: {
    ...paperTheme.colors,
    surfaceMuted: paperTheme.colors.surfaceVariant,
    text: paperTheme.colors.onSurface,
    muted: paperTheme.colors.onSurfaceVariant,
    subtle: paperTheme.colors.onSurfaceVariant,
    border: paperTheme.colors.outlineVariant,
    accent: paperTheme.colors.tertiary,
    success: paperTheme.colors.tertiary,
    danger: paperTheme.colors.error,
    warning: paperTheme.colors.secondary,
    blueSoft: paperTheme.colors.primaryContainer,
    greenSoft: paperTheme.colors.tertiaryContainer,
    orangeSoft: paperTheme.colors.secondaryContainer,
    redSoft: paperTheme.colors.errorContainer,
    disabled: paperTheme.colors.onSurfaceDisabled,
    overlay: paperTheme.colors.backdrop,
  },
  fonts: {
    body: 'Inter-Regular',
    bodyMedium: 'Inter-Medium',
    bodySemibold: 'Inter-SemiBold',
    bodyBold: 'Inter-Bold',
    heading: 'Inter-Bold',
  },
  typography: {
    micro: 9,
    caption: 11,
    label: 12,
    meta: 13,
    bodySmall: 14,
    body: 15,
    bodyLarge: 16,
    subtitle: 17,
    sectionTitle: 20,
    title: 22,
    display: 28,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
  },
  controls: {
    fieldHeight: 52,
  },
  shadow: {
    shadowColor: paperTheme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3,
  },
} as const;
