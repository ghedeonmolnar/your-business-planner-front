import React, { ReactNode, useContext } from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/shared/theme/theme';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const bottomInset = tabBarHeight === undefined ? insets.bottom : 0;

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background,
          flex: 1,
          paddingBottom: bottomInset,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
