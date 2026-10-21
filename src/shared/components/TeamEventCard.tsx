import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import 'dayjs/locale/ro';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';

type TeamEventCardProps = {
  address: string | null;
  date: string;
  durationMinutes: number;
  earnings: number;
  location: string | null;
  onPress?: () => void;
  participantLabel: string;
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const formatTeamEventDate = (date: string) => {
  const parsedDate = dayjs(date).locale('ro');

  return `${parsedDate.format('D')} ${capitalize(parsedDate.format('MMMM'))}`;
};

export const formatTeamEventDuration = (durationMinutes: number) => {
  if (durationMinutes <= 0) {
    return 'Ora necompletată';
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const hourLabel = hours === 1 ? '1 oră' : `${hours} ore`;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return minutes === 0 ? hourLabel : `${hourLabel} ${minutes} min`;
};

export function TeamEventCard({
  address,
  date,
  durationMinutes,
  earnings,
  location,
  onPress,
  participantLabel,
}: TeamEventCardProps) {
  const locationLabel = location ?? 'Locație necompletată';

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        accessibilityLabel={`Deschide evenimentul din ${locationLabel}`}
        accessibilityRole={onPress ? 'button' : undefined}
        activeOpacity={onPress ? 0.72 : 1}
        disabled={!onPress}
        onPress={onPress}
        style={styles.contentRow}
      >
        <View style={styles.eventInfo}>
          <Text style={styles.title}>
            {formatTeamEventDate(date)} - {locationLabel}
          </Text>
          <Text numberOfLines={1} style={styles.details}>
            {participantLabel} - {address?.trim() || locationLabel} -{' '}
            {formatTeamEventDuration(durationMinutes)}
          </Text>
        </View>
        <Text style={styles.earnings}>{formatExactMoney(earnings)}</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  contentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  eventInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    lineHeight: 23,
  },
  details: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
    lineHeight: 21,
    marginTop: theme.spacing.sm,
  },
  earnings: {
    color: theme.colors.success,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    lineHeight: 23,
    textAlign: 'right',
  },
});
