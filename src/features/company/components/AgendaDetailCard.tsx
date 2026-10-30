import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AgendaItem } from '@/features/company/schemas/agendaSchemas';
import { BookingStatusPill } from '@/features/bookings/components/BookingStatusPill';
import {
  bookingPaymentCategories,
  paymentMethodLabels,
} from '@/features/bookings/utils/bookingLabels';
import { Card } from '@/shared/components/Card';
import { InfoRow } from '@/shared/components/InfoRow';
import { MetaPill } from '@/shared/components/MetaPill';
import { companyNow, formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

export function AgendaDetailCard({
  item,
  onOpen,
}: {
  item: AgendaItem;
  onOpen: () => void;
}) {
  const overdue =
    item.kind !== 'receipt' &&
    item.kind !== 'event' &&
    item.due_at < companyNow().format('YYYY-MM-DD');
  const paymentCategory =
    bookingPaymentCategories.incoming.find(
      category => category.id === item.category,
    )?.name ?? 'Încasare';
  const label =
    item.kind === 'menus'
      ? 'Meniuri finale de confirmat'
      : item.kind === 'advance'
        ? 'Avans convenit'
        : item.kind === 'planned'
          ? `${paymentCategory} planificat${item.category === 'advance' ? '' : 'ă'}`
          : paymentCategory;
  return (
    <Card
      onPress={onOpen}
      accessibilityLabel={`Deschide rezervarea pentru ${item.client_name ?? 'client'}`}
    >
      <View style={styles.header}>
        <View style={styles.labels}>
          <Text style={styles.client}>
            {item.client_name || 'Client fără nume'}
          </Text>
          <Text style={styles.secondary}>
            {item.hall_name || 'Sală indisponibilă'}
          </Text>
        </View>
        {item.amount !== null ? (
          <Text style={styles.amount}>{formatExactMoney(item.amount)}</Text>
        ) : null}
      </View>
      <InfoRow
        icon="calendar-outline"
        label="Eveniment"
        value={formatLongDate(item.event_date)}
      />
      {item.kind === 'event' ? (
        <BookingStatusPill status={item.event_status} />
      ) : (
        <>
          <View style={styles.pills}>
            <MetaPill
              label={label}
              tone={item.kind === 'receipt' ? 'success' : 'primary'}
            />
            {overdue ? <MetaPill label="Termen depășit" tone="danger" /> : null}
          </View>
          <InfoRow
            icon={
              item.kind === 'receipt'
                ? 'checkmark-circle-outline'
                : 'time-outline'
            }
            label={item.kind === 'receipt' ? 'Încasat la' : 'Termen'}
            value={formatLongDate(item.due_at)}
          />
          {item.method ? (
            <Text style={styles.secondary}>
              {paymentMethodLabels[item.method]}
            </Text>
          ) : null}
          {item.kind === 'menus' ? (
            <Text style={styles.secondary}>
              Completează numărul exact de meniuri din editarea rezervării.
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  labels: { flex: 1, minWidth: '50%', gap: theme.spacing.xs },
  client: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
  secondary: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  amount: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
    flexShrink: 1,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
