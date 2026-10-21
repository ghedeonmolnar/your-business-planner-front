import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { HallDay } from '@/features/bookings/api/bookingsApi';
import { IconBadge } from '@/shared/components/IconBadge';
import { formatCompanyTimeRange } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';

export function CalendarHallRow({
  hall,
  typeLabel,
  onPress,
}: {
  hall: HallDay;
  typeLabel: string;
  onPress: () => void;
}) {
  const free = hall.status === 'free';
  const status = free
    ? 'Liberă'
    : hall.status === 'tentative'
      ? 'Provizorie'
      : hall.status === 'completed'
        ? 'Finalizată'
        : 'Rezervat';
  const schedule = formatCompanyTimeRange(hall.starts_at, hall.ends_at);
  const description = free ? 'Liberă' : typeLabel || 'Rezervare';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${hall.booking_id ? 'Deschide rezervarea' : 'Rezervă sala'} ${hall.name}`}
      accessibilityHint={`${description}, ${status}${schedule ? `, ${schedule}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <IconBadge icon="business-outline" />
      <View style={styles.body}>
        <View style={styles.identity}>
          <Text style={styles.name}>{hall.name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.schedule}>
          {!free ? (
            <Ionicons
              accessible={false}
              name="time-outline"
              size={theme.typography.body}
              color={theme.colors.menu.muted}
            />
          ) : null}
          <Text style={styles.time}>
            {free ? '—' : schedule || 'Program necompletat'}
          </Text>
        </View>
        <View style={[styles.status, free ? styles.free : styles.occupied]}>
          <Text
            style={[
              styles.statusText,
              free ? styles.freeText : styles.occupiedText,
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    borderColor: theme.colors.menu.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    minHeight: theme.spacing.xl * 3,
  },
  pressed: { opacity: 0.7 },
  body: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  identity: { flexBasis: '35%', flexGrow: 1, gap: theme.spacing.xs },
  name: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
  },
  description: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
  schedule: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    maxWidth: '100%',
    flexShrink: 1,
  },
  time: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    flexShrink: 1,
  },
  status: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    maxWidth: '100%',
  },
  occupied: { backgroundColor: theme.colors.menu.primarySoft },
  free: { backgroundColor: theme.colors.menu.successSoft },
  statusText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.caption,
  },
  freeText: { color: theme.colors.menu.success },
  occupiedText: { color: theme.colors.menu.primary },
});
