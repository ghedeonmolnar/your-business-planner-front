import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { hallStyles } from '@/features/halls/components/hallStyles';

export function HallDetailsLoading() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Se încarcă detaliile sălii"
      style={hallStyles.stack}
    >
      {[0, 1].map(key => (
        <Card key={key} style={hallStyles.card}>
          <View style={styles.title} />
          <View style={styles.content} />
          <View style={styles.line} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    width: '60%',
    height: theme.spacing.xl,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.menu.primarySoft,
  },
  content: {
    height: theme.spacing.xxl * 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.menu.background,
  },
  line: {
    width: '80%',
    height: theme.spacing.lg,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.menu.background,
  },
});
