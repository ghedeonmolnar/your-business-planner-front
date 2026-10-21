import React from 'react';
import { Image, StyleSheet } from 'react-native';

const logoSource = require('../../../assets/app-icon/balon-roz.png');

type BrandLogoProps = {
  size?: number;
};

export function BrandLogo({ size = 56 }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="Your Business Planner"
      accessibilityRole="image"
      resizeMode="contain"
      source={logoSource}
      style={[styles.logo, { height: size, width: size }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
