import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
};

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <Card style={styles.container}>
      <Ionicons name={icon} size={34} color={theme.colors.subtle} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
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
