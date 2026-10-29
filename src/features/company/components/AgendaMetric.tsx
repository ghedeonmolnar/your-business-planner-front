import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';

type AgendaMetricProps = {
  label: string;
  title?: string;
  value: string | number;
  caption: string;
  icon: IconName;
  attention?: boolean;
  currency?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AgendaMetric({
  label,
  title = label,
  value,
  caption,
  icon,
  attention,
  currency,
  onPress,
  style,
}: AgendaMetricProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${label}: ${value}${currency ? ' lei' : ''}. ${caption}`}
      accessibilityHint="Deschide lista cu detalii"
      style={[styles.card, attention && styles.attention, style]}
      contentStyle={styles.content}
    >
      <View style={styles.icons}>
        <IconBadge icon={icon} tone={attention ? 'invitations' : 'primary'} />
        <Text style={styles.label}>{title}</Text>
        <Ionicons
          accessible={false}
          name="chevron-forward"
          color={theme.colors.menu.primary}
          size={theme.typography.bodyLarge}
        />
      </View>
      <View style={styles.figures}>
        <Text style={[styles.value, attention && styles.attentionValue]}>
          {value}
          {currency ? <Text style={styles.currency}> lei</Text> : null}
        </Text>
        <Text style={[styles.caption, attention && styles.attentionValue]}>
          {caption}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  card: { padding: theme.spacing.md, gap: theme.spacing.sm },
  attention: { backgroundColor: theme.colors.menu.invitationsSoft },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    flex: 1,
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.bodySmall,
  },
  figures: { flexGrow: 1, justifyContent: 'flex-end', gap: theme.spacing.xs },
  value: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
  currency: { fontFamily: theme.fonts.body, fontSize: theme.typography.label },
  attentionValue: { color: theme.colors.menu.text },
  caption: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
});
