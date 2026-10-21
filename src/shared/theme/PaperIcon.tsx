import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';

const paperIconNames: Record<string, IconName> = {
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward',
  'chevron-left': 'chevron-back',
  'chevron-right': 'chevron-forward',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'dots-vertical': 'ellipsis-vertical',
  'dots-horizontal': 'ellipsis-horizontal',
  magnify: 'search-outline',
  close: 'close',
  menu: 'menu',
  check: 'checkmark',
  minus: 'remove',
  plus: 'add',
  eye: 'eye-outline',
  'eye-off': 'eye-off-outline',
};

type PaperIconProps = {
  name: string;
  size: number;
  color?: string;
  direction: 'rtl' | 'ltr';
  testID?: string;
};

export function PaperIcon({
  name,
  size,
  color = theme.colors.onSurface,
  direction,
  testID,
}: PaperIconProps) {
  const iconName = paperIconNames[name] ?? 'help-circle-outline';

  return (
    <Ionicons
      accessible={false}
      color={color}
      name={iconName}
      size={size}
      style={direction === 'rtl' ? styles.rtl : undefined}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({ rtl: { transform: [{ scaleX: -1 }] } });
