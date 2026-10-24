import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';

type RecordCardProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function RecordCard({
  title,
  subtitle,
  leading,
  badge,
  children,
  actions,
  highlighted,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: RecordCardProps) {
  const singleColumn = useSingleColumnLayout();
  return (
    <Card
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      highlighted={highlighted}
      onPress={onPress}
      style={style}
    >
      <View style={styles.row}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <View style={styles.content}>
          <View
            style={[styles.identity, singleColumn ? styles.column : undefined]}
          >
            <View style={styles.labels}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
            {badge}
          </View>
          {children}
        </View>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  leading: { flexShrink: 0 },
  content: { flex: 1, minWidth: 0, gap: theme.spacing.sm },
  identity: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  labels: { flexGrow: 1, flexShrink: 1, minWidth: 0, gap: theme.spacing.xs },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
  },
  subtitle: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  actions: { gap: theme.spacing.sm },
});
