import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Booking } from '@/features/bookings/types';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';
import { Card } from '@/shared/components/Card';
import { MetaPill } from '@/shared/components/MetaPill';
import { IconButton } from '@/shared/components/IconButton';
import { AppButton } from '@/shared/components/AppButton';
import {
  formatCompanyTimeRange,
  formatLongDate,
} from '@/shared/utils/formatDate';
import { buildContactUrl, openContact } from '@/shared/utils/contactLinks';
import { theme } from '@/shared/theme/theme';

export function BookingSummaryCard({
  booking,
  eventType,
  canManage,
  onShare,
  onCompletePhone,
}: {
  booking: Booking;
  eventType: string;
  canManage: boolean;
  onShare: () => void;
  onCompletePhone: () => void;
}) {
  const validPhone = Boolean(buildContactUrl('call', booking.client_phone));
  return (
    <Card style={styles.card}>
      <View style={styles.summaryHeader}>
        <View style={styles.sectionLabels}>
          <Text style={styles.client}>
            {booking.client_name ?? 'Client necompletat'}
          </Text>
          <Text style={styles.hall}>
            {booking.hall_name ?? 'Sală necompletată'}
          </Text>
        </View>
        <View style={styles.summaryBadges}>
          <BookingStatusPill status={booking.status} />
          <MetaPill icon="heart-outline" label={eventType} tone="primary" />
        </View>
      </View>
      <View style={[styles.row, styles.schedule]}>
        <View style={styles.scheduleItem}>
          <Ionicons
            accessible={false}
            name="calendar-outline"
            color={theme.colors.menu.muted}
            size={theme.typography.title}
          />
          <Text style={styles.body}>{formatLongDate(booking.date)}</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons
            accessible={false}
            name="time-outline"
            color={theme.colors.menu.muted}
            size={theme.typography.title}
          />
          <Text style={styles.body}>
            {formatCompanyTimeRange(booking.starts_at, booking.ends_at) ??
              'Program necompletat'}
          </Text>
        </View>
      </View>
      {canManage ? (
        <>
          <View style={styles.row}>
            <Ionicons
              accessible={false}
              name="call-outline"
              color={theme.colors.menu.primary}
              size={theme.typography.title}
            />
            <View style={styles.phone}>
              <Text style={styles.phoneText}>
                {booking.client_phone || 'Telefon lipsă'}
              </Text>
              {!validPhone && booking.client_phone ? (
                <Text style={styles.subtitle}>Telefon invalid</Text>
              ) : null}
            </View>
            <IconButton
              icon="call-outline"
              accessibilityLabel="Apelează clientul"
              disabled={!validPhone}
              onPress={() => openContact('call', booking.client_phone)}
            />
            <IconButton
              icon="logo-whatsapp"
              accessibilityLabel="Verifică mesajul WhatsApp pentru client"
              disabled={!validPhone}
              color={theme.colors.menu.success}
              backgroundColor={theme.colors.menu.successSoft}
              onPress={onShare}
            />
          </View>
          {!validPhone ? (
            <AppButton
              label="Completează telefonul"
              variant="ghost"
              multiline
              onPress={onCompletePhone}
            />
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
