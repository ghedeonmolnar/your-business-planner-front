import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { CustomerListItem } from '@/features/company/types';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';

type CustomerCardProps = {
  customer: CustomerListItem;
  onOpen: () => void;
};

export function CustomerCard({ customer, onOpen }: CustomerCardProps) {
  const countLabel = `${customer.bookings_count} ${customer.bookings_count === 1 ? 'rezervare' : 'rezervări'}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Vezi rezervările pentru ${customer.name}`}
      accessibilityHint={`${customer.phone || 'Telefon necompletat'}, ${countLabel}`}
      android_ripple={{ color: theme.colors.menu.primarySoft }}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.identity}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>
            {customer.phone || 'Telefon necompletat'}
          </Text>
        </View>
        <MetaPill
          icon="calendar-outline"
          label={countLabel}
          color={theme.colors.menu.primary}
          style={styles.count}
          textStyle={styles.countText}
        />
      </View>
      <Ionicons
        accessible={false}
        name="chevron-forward"
        size={theme.typography.subtitle}
        color={theme.colors.menu.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.menu.surface,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: theme.spacing.xl * 3,
    overflow: 'hidden',
    padding: theme.spacing.md,
  },
  pressed: { opacity: 0.7 },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  identity: {
    flexBasis: '50%',
    flexGrow: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  name: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  phone: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
  },
  count: {
    backgroundColor: theme.colors.menu.primarySoft,
    borderWidth: 0,
    marginTop: 0,
    marginRight: 0,
    maxWidth: '100%',
  },
  countText: {
    color: theme.colors.menu.primary,
    fontSize: theme.typography.label,
  },
});
