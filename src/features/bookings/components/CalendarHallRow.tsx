import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { HallDay } from '@/features/bookings/api/bookingsApi';
import { MetaPill } from '@/shared/components/MetaPill';
import { IconBadge } from '@/shared/components/IconBadge';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { formatCompanyTimeRange } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';

export function CalendarHallRow({
  hall,
  typeLabel,
  onPress,
}: {
  hall: HallDay;
  typeLabel: string;
  onPress?: () => void;
}) {
  const singleColumn = useSingleColumnLayout();
  const free = hall.status === 'free';
  const inactive = hall.status === 'inactive';
  const status = free
    ? 'Liberă'
    : hall.status === 'inactive'
      ? 'Inactivă'
      : hall.status === 'tentative'
        ? 'În așteptarea avansului'
        : hall.status === 'completed'
          ? 'Finalizată'
          : 'Rezervat';
  const schedule = formatCompanyTimeRange(hall.starts_at, hall.ends_at, false);
  const description =
    hall.status === 'inactive'
      ? 'Indisponibilă pentru rezervări noi'
      : free
        ? 'Liberă'
        : typeLabel || 'Rezervare';
  return (
    <Pressable
      testID={`calendar-hall:${hall.id}:${hall.booking_id ?? 'free'}`}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      accessibilityLabel={
        inactive
          ? `${hall.name}, inactivă`
          : `${hall.booking_id ? 'Deschide rezervarea' : 'Rezervă sala'} ${hall.name}`
      }
      accessibilityHint={`${description}, ${status}${schedule ? `, ${schedule}` : ''}`}
      style={({ pressed }) => [
        styles.row,
        free ? styles.free : undefined,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <IconBadge icon="business-outline" tone={free ? 'finance' : 'primary'} />
      <View style={[styles.body, singleColumn ? styles.column : undefined]}>
        <View
          style={[
            styles.identity,
            singleColumn ? styles.columnIdentity : undefined,
          ]}
        >
          <Text style={styles.name}>{hall.name}</Text>
          {!free ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {!free && !inactive ? (
          <View style={styles.schedule}>
            <Ionicons
              accessible={false}
              name="time-outline"
              size={theme.typography.body}
              color={theme.colors.menu.muted}
            />
            <Text style={styles.time}>{schedule || 'Program necompletat'}</Text>
          </View>
        ) : null}
        <MetaPill
          label={status}
          tone={
            free
              ? 'success'
              : inactive
                ? 'neutral'
                : hall.status === 'tentative'
                  ? 'warning'
                  : 'primary'
          }
        />
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
    backgroundColor: theme.colors.menu.surface,
    padding: theme.spacing.sm,
    minHeight: theme.controls.fieldHeight,
  },
  pressed: { backgroundColor: theme.colors.menu.selected },
  free: {
    backgroundColor: theme.colors.menu.successSoft,
    borderColor: theme.colors.menu.successSoft,
  },
  body: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  identity: {
    flexBasis: '35%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  columnIdentity: { flexBasis: 'auto' },
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
});
