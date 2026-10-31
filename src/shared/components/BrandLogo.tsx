import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

const DEFAULT_LOGO_WIDTH = theme.controls.fieldHeight;

export function BrandLogo({ width = DEFAULT_LOGO_WIDTH }: { width?: number }) {
  return (
    <Image
      accessibilityLabel="Your Business Planner"
      accessibilityRole="image"
      accessible
      pointerEvents="none"
      resizeMode="contain"
      source={require('@/shared/branding/ybp-logo.png')}
      style={[styles.logo, { width }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    flexShrink: 1,
    maxWidth: '100%',
  },
});
