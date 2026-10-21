import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ActionTile, ActionItem } from '@/shared/components/ActionTile';
import { theme } from '@/shared/theme/theme';

type ActionListProps = {
  items: ActionItem[];
  style?: StyleProp<ViewStyle>;
};

export function ActionList({ items, style }: ActionListProps) {
  return (
    <View style={[styles.list, style]}>
      {items.map(({ id, style: itemStyle, ...item }, index) => (
        <ActionTile
          key={id}
          variant="row"
          {...item}
          style={[
            styles.row,
            index > 0 ? styles.divider : undefined,
            itemStyle,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: theme.colors.menu.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  row: { borderRadius: 0, paddingHorizontal: theme.spacing.lg },
  divider: {
    borderTopColor: theme.colors.menu.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
