import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Booking } from '@/features/bookings/types';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
import { formatCompanyTime, formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

type AgendaBookingCardProps = {
  booking: Booking;
  featured?: boolean;
  first?: boolean;
  last?: boolean;
  showFinance: boolean;
  onOpen: () => void;
};

export function AgendaBookingCard({
  booking,
  featured = false,
  first = false,
  last = false,
  showFinance,
  onOpen,
}: AgendaBookingCardProps) {
  const confirmed = booking.status === 'confirmed';
  const statusColor = confirmed
    ? theme.colors.menu.success
    : theme.colors.menu.invitations;
  return (
    <Card
      style={[
        styles.card,
        first ? styles.first : undefined,
        last ? styles.last : undefined,
        featured ? styles.featured : undefined,
      ]}
    >
      {featured ? (
        <View style={styles.nextBadge}>
          <Ionicons
            accessible={false}
            name="flash"
            color={theme.colors.menu.primary}
            size={theme.typography.bodyLarge}
          />
          <Text style={styles.nextLabel}>Urmează cel mai curând</Text>
        </View>
      ) : null}
      <View style={styles.identity}>
        <Text style={[styles.name, featured ? styles.featuredName : undefined]}>
          {booking.client_name ?? 'Client necompletat'}
        </Text>
        <View
          style={[
            styles.status,
            {
              backgroundColor: confirmed
                ? theme.colors.menu.successSoft
                : theme.colors.menu.invitationsSoft,
            },
          ]}
        >
          <Ionicons
            accessible={false}
            name={confirmed ? 'checkmark-circle' : 'time-outline'}
            color={statusColor}
            size={theme.typography.bodyLarge}
          />
          <Text style={styles.statusLabel}>
            {bookingStatusLabels[booking.status]}
          </Text>
        </View>
      </View>
      <View style={styles.detail}>
        <Ionicons accessible={false} name="location-outline" {...detailIcon} />
        <Text style={styles.detailText}>
          {booking.hall_name ?? 'Rămâne de adăugat'}
        </Text>
      </View>
      <View style={styles.schedule}>
        <View style={styles.detail}>
          <Ionicons
            accessible={false}
            name="calendar-outline"
            {...detailIcon}
          />
          <Text style={styles.detailText}>{formatLongDate(booking.date)}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons accessible={false} name="time-outline" {...detailIcon} />
          <Text style={styles.detailText}>
            {formatCompanyTime(booking.starts_at)}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        {showFinance && booking.paid_amount !== undefined ? (
          <View
            accessible
            accessibilityLabel={`Încasat: ${formatExactMoney(booking.paid_amount)}`}
            style={styles.amount}
          >
            <Ionicons
              accessible={false}
              name="wallet-outline"
              size={theme.typography.bodyLarge}
              color={theme.colors.menu.primary}
            />
            <Text style={styles.amountText}>
              {formatExactMoney(booking.paid_amount)}
            </Text>
          </View>
        ) : null}
        <AppButton
          accessibilityLabel={`Deschide rezervarea pentru ${booking.client_name ?? 'client necompletat'}`}
          label="Deschide rezervarea"
          icon="arrow-forward"
          iconPosition="right"
          color={theme.colors.menu.primary}
          onPress={onOpen}
          size="small"
          style={styles.openButton}
          variant="ghost"
        />
      </View>
    </Card>
  );
}

const detailIcon = {
  color: theme.colors.menu.muted,
  size: theme.typography.bodyLarge,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: 0,
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  first: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  last: {
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
  },
  featured: {
    backgroundColor: theme.colors.menu.selected,
    borderColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  nextBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  nextLabel: {
    color: theme.colors.menu.primary,
    flexShrink: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
  identity: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.menu.text,
    flexBasis: '50%',
    flexGrow: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
  },
  featuredName: { fontSize: theme.typography.subtitle },
  status: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusLabel: {
    color: theme.colors.menu.text,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  detail: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm },
  detailText: {
    color: theme.colors.menu.muted,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  schedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.spacing.xl,
    rowGap: theme.spacing.xs,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'space-between',
  },
  amount: {
    alignItems: 'center',
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  amountText: {
    color: theme.colors.menu.primary,
    flexShrink: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
  },
  openButton: { marginLeft: 'auto' },
});
