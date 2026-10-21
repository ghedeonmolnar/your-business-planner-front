import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ActionTile, ActionItem } from '@/shared/components/ActionTile';
import { theme } from '@/shared/theme/theme';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';

type ActionGridProps = {
  items: ActionItem[];
  columns?: 1 | 2;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
};

export function ActionGrid({
  items,
  columns,
  style,
  itemStyle,
}: ActionGridProps) {
  const singleColumn = useSingleColumnLayout();

  return (
    <View style={[styles.grid, style]}>
      {items.map(({ id, style: tileStyle, ...item }) => (
        <View
          key={id}
          style={
            columns === 1 || singleColumn ? styles.fullWidth : styles.halfWidth
          }
        >
          <ActionTile {...item} style={[styles.tile, tileStyle, itemStyle]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -theme.spacing.xs },
  fullWidth: { padding: theme.spacing.xs, width: '100%' },
  halfWidth: { padding: theme.spacing.xs, width: '50%' },
  tile: { flex: 1 },
});
