import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/shared/components/Card';
import { LoadingState } from '@/shared/components/LoadingState';
import { theme } from '@/shared/theme/theme';

export function BookingDetailsLoading() {
  return (
    <View
      accessibilityLabel="Se încarcă rezervarea"
      accessibilityRole="progressbar"
    >
      <LoadingState />
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={styles.cards}
      >
        {['sumar', 'eveniment', 'financiar'].map(section => (
          <Card key={section} style={styles.card}>
            <View style={[styles.line, styles.title]} />
            <View style={styles.line} />
            <View style={styles.line} />
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: theme.spacing.md },
  card: { borderWidth: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  line: {
    height: theme.spacing.md,
    backgroundColor: theme.colors.menu.border,
    borderRadius: theme.radius.sm,
  },
  title: { height: theme.spacing.xl, alignSelf: 'flex-start', width: '70%' },
});
