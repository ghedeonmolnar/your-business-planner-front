import React, { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type ContentSectionProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  size?: 'page' | 'section';
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export function ContentSection({
  title,
  subtitle,
  action,
  children,
  size = 'section',
  style,
  titleStyle,
  subtitleStyle,
}: ContentSectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.heading}>
        <View style={action ? styles.titleRow : undefined}>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              size === 'page' ? styles.pageTitle : undefined,
              titleStyle,
              action ? styles.titleWithAction : undefined,
            ]}
          >
            {title}
          </Text>
          {action}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm },
  heading: { gap: theme.spacing.xs },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  titleWithAction: { flexGrow: 1, flexShrink: 1 },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
  pageTitle: { fontSize: theme.typography.display },
  subtitle: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
});
