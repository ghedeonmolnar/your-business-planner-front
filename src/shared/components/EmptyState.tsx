import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';
import { AppButton } from '@/shared/components/AppButton';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Card style={styles.container}>
      <Ionicons
        accessible={false}
        name={icon}
        size={theme.spacing.xxl}
        color={theme.colors.menu.muted}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action ? (
        <AppButton
          label={action.label}
          onPress={action.onPress}
          variant="soft"
          multiline
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontFamily: theme.fonts.bodySemibold,
    marginTop: theme.spacing.md,
  },
  message: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
