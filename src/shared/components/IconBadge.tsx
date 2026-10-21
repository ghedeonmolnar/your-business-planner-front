import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

export type IconBadgeTone =
  'primary' | 'staff' | 'finance' | 'invitations' | 'help';

type IconBadgeProps = {
  icon: IconName;
  tone?: IconBadgeTone;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
};

const tones = {
  primary: {
    color: theme.colors.menu.primary,
    backgroundColor: theme.colors.menu.primarySoft,
  },
  staff: {
    color: theme.colors.menu.staff,
    backgroundColor: theme.colors.menu.staffSoft,
  },
  finance: {
    color: theme.colors.menu.finance,
    backgroundColor: theme.colors.menu.financeSoft,
  },
  invitations: {
    color: theme.colors.menu.invitations,
    backgroundColor: theme.colors.menu.invitationsSoft,
  },
  help: {
    color: theme.colors.menu.help,
    backgroundColor: theme.colors.menu.helpSoft,
  },
};

const sizes = {
  small: {
    frame: theme.spacing.xxl + theme.spacing.xs,
    icon: theme.typography.sectionTitle,
  },
  medium: { frame: theme.spacing.xl * 2, icon: theme.typography.display },
  large: { frame: theme.spacing.xl * 3, icon: theme.spacing.xxl },
};

export function IconBadge({
  icon,
  tone = 'primary',
  size = 'small',
  style,
}: IconBadgeProps) {
  const colors = tones[tone];
  const dimensions = sizes[size];

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          height: dimensions.frame,
          width: dimensions.frame,
        },
        style,
      ]}
    >
      <Ionicons color={colors.color} name={icon} size={dimensions.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
  },
});
