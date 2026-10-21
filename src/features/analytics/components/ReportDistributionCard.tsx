import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { DistributionItem } from '@/features/analytics/types';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';

type Props = { title: string; items: DistributionItem[] };

export function ReportDistributionCard({ title, items }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 5);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {visible.length === 0 ? (
        <Text style={styles.empty}>
          Nu există date pentru această perioadă.
        </Text>
      ) : null}
      {visible.map(item => (
        <View key={item.label} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemCount}>
              {item.count} · {item.percent.toLocaleString('ro-RO')}%
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.max(0, Math.min(100, item.percent))}%` },
              ]}
            />
          </View>
        </View>
      ))}
      {items.length > 5 ? (
        <Pressable
          accessibilityLabel={`${expanded ? 'Restrânge' : 'Vezi toate'} ${title}`}
          accessibilityRole="button"
          onPress={() => setExpanded(value => !value)}
          style={styles.expand}
        >
          <Text style={styles.expandText}>
            {expanded ? 'Restrânge' : 'Vezi toate'}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.md },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  empty: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  item: { marginBottom: theme.spacing.md },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemLabel: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.meta,
    paddingRight: theme.spacing.sm,
  },
  itemCount: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  barTrack: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    height: 7,
    marginTop: theme.spacing.xs,
  },
  barFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 7,
  },
  expand: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44 },
  expandText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
});
