import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

const DEFAULT_LOGO_WIDTH = theme.controls.fieldHeight * 4;
const BRAND_LOGO_ASPECT_RATIO = 3;
const BRAND_LOGO = require('@/shared/branding/ybp-logo.png');

export function BrandLogo({ width = DEFAULT_LOGO_WIDTH }: { width?: number }) {
  return (
    <Image
      accessibilityLabel="Your Business Planner"
      accessibilityRole="image"
      accessible
      pointerEvents="none"
      resizeMode="contain"
      source={BRAND_LOGO}
      style={[styles.logo, { width }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    aspectRatio: BRAND_LOGO_ASPECT_RATIO,
    flexShrink: 1,
    maxWidth: '100%',
  },
});
