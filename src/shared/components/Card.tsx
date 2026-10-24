import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type CardProps = {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
};

function flattenCardChildren(children: ReactNode): ReactNode {
  return React.Children.map(children, child =>
    React.isValidElement<{ children?: ReactNode }>(child) &&
    child.type === React.Fragment
      ? flattenCardChildren(child.props.children)
      : child,
  );
}

export function Card({
  accessibilityLabel,
  accessibilityHint,
  children,
  onPress,
  style,
  highlighted = false,
}: CardProps) {
  const cardStyle: ViewStyle =
    StyleSheet.flatten([
      styles.card,
      highlighted ? styles.highlighted : undefined,
      style,
    ]) ?? {};
  const {
    alignItems,
    justifyContent,
    flexDirection,
    flexWrap,
    gap,
    rowGap,
    columnGap,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingStart,
    paddingEnd,
    borderWidth,
    ...containerStyle
  } = cardStyle;
  return (
    <PaperCard
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={onPress ? 'button' : undefined}
      contentStyle={{
        alignItems,
        justifyContent,
        flexDirection,
        flexWrap,
        gap,
        rowGap,
        columnGap,
        padding,
        paddingHorizontal,
        paddingVertical,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        paddingStart,
        paddingEnd,
      }}
      mode={borderWidth === 0 ? 'contained' : 'outlined'}
      onPress={onPress}
      style={containerStyle}
    >
      {flattenCardChildren(children)}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.lg,
    borderWidth: 0,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  highlighted: {
    backgroundColor: theme.colors.menu.selected,
    borderColor: theme.colors.menu.primarySoft,
    borderWidth: 1,
  },
});
