import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type MetricCardProps = {
  label: string;
  value: string | number;
  caption?: string;
  icon: IconName;
  layout?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
};

export function MetricCard({
  label,
  value,
  caption,
  icon,
  layout = 'horizontal',
  style,
}: MetricCardProps) {
  const vertical = layout === 'vertical';
  return (
    <Card style={[styles.card, vertical ? styles.vertical : undefined, style]}>
      <IconBadge icon={icon} />
      <View
        style={[styles.labels, vertical ? styles.verticalLabels : undefined]}
      >
        <Text
          style={[styles.label, vertical ? styles.verticalTitle : undefined]}
        >
          {label}
        </Text>
        <Text style={[styles.value, vertical ? styles.centered : undefined]}>
          {value}
        </Text>
        {caption ? (
          <Text
            style={[
              styles.label,
              vertical ? styles.verticalCaption : undefined,
            ]}
          >
            {caption}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  vertical: { flexDirection: 'column', gap: theme.spacing.sm },
  verticalLabels: { flex: 0, alignSelf: 'stretch' },
  centered: { textAlign: 'center' },
  verticalTitle: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    textAlign: 'center',
  },
  verticalCaption: {
    fontSize: theme.typography.label,
    textAlign: 'center',
  },
  labels: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  label: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  value: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
});
