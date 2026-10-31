import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandLogo } from '@/shared/components/BrandLogo';
import { theme } from '@/shared/theme/theme';

const LOGIN_LOGO_WIDTH = theme.controls.fieldHeight * 3;

export function LoginBrandLogo() {
  return (
    <View style={styles.container}>
      <BrandLogo width={LOGIN_LOGO_WIDTH} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: theme.spacing.xl },
});
