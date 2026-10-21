import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Divider } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

export function SectionDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <Divider style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: { marginVertical: theme.spacing.lg },
});
