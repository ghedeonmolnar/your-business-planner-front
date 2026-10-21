import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type CardProps = {
  accessibilityLabel?: string;
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
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
  children,
  onPress,
  style,
}: CardProps) {
  const cardStyle: ViewStyle = StyleSheet.flatten([styles.card, style]) ?? {};
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
});
