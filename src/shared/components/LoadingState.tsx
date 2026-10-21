import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

export function LoadingState() {
  return (
    <View
      accessibilityLabel="Se încarcă"
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <ActivityIndicator animating />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: theme.spacing.xl },
});
