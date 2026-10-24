import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/shared/theme/theme';

export function ListItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({ separator: { height: theme.spacing.sm } });
