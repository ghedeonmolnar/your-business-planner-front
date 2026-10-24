import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';

type ListResultsHeaderProps = {
  label: string;
  description?: string;
  sortControl?: ReactNode;
  onReset?: () => void;
};

export function ListResultsHeader({
  label,
  description,
  sortControl,
  onReset,
}: ListResultsHeaderProps) {
  const singleColumn = useSingleColumnLayout();
  return (
    <View style={[styles.row, singleColumn ? styles.column : undefined]}>
      <View style={styles.labels}>
        <Text accessibilityLiveRegion="polite" style={styles.title}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {sortControl ? <View style={styles.sort}>{sortControl}</View> : null}
      {onReset ? (
        <AppButton
          label="Resetează filtrele"
          variant="ghost"
          size="small"
          onPress={onReset}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  labels: { flexGrow: 1, flexShrink: 1, gap: theme.spacing.xs },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  description: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  sort: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
});
