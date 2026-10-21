import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

export function SectionTitle({ title }: { title: string }) {
  return <Text style={eventFormStyles.sectionTitle}>{title}</Text>;
}

export const eventFormStyles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.sectionTitle,
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    lineHeight: 19,
    marginBottom: theme.spacing.lg,
  },
  helperText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeField: {
    flex: 1,
  },
});
