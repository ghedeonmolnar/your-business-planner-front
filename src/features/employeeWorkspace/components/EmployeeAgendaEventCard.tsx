import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { buildContactUrl, openContact } from '@/shared/utils/contactLinks';
import { Card } from '@/shared/components/Card';
import { EventMapButton } from '@/shared/components/EventMapButton';
import { IconButton } from '@/shared/components/IconButton';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';
import { formatEventDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

type Props = {
  event: EmployeeEvent;
  onDetails: (event: EmployeeEvent) => void;
};

export function EmployeeAgendaEventCard({ event, onDetails }: Props) {
  const canCall = Boolean(buildContactUrl('call', event.contact_phone));
  const canWhatsApp = Boolean(buildContactUrl('whatsapp', event.contact_phone));

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={`Detalii eveniment ${event.location ?? 'fără locație'}`}
          accessibilityRole="button"
          onPress={() => onDetails(event)}
          style={styles.details}
        >
          <Text style={styles.location}>
            {event.location ?? 'Locație necompletată'}{' '}
            {event.address ? (
              <Text style={styles.address}>{event.address}</Text>
            ) : null}
          </Text>
          <Text style={styles.schedule}>
            {formatEventDate(event.date, event.start_time, event.end_time)}
          </Text>
          <View style={styles.pills}>
            {event.projected_earnings !== null ? (
              <MetaPill
                color={theme.colors.success}
                icon="wallet-outline"
                label={`Câștig: ${formatExactMoney(event.projected_earnings)}`}
              />
            ) : null}
            {event.amount_to_collect != null ? (
              <MetaPill
                color={theme.colors.primary}
                icon="cash-outline"
                label={`De încasat: ${formatExactMoney(event.amount_to_collect)}`}
              />
            ) : null}
            {event.mascot ? <MetaPill label={event.mascot.name} /> : null}
          </View>
        </Pressable>
        {canCall || canWhatsApp || event.map_location?.confirmed ? (
          <View style={styles.actions}>
            <EventMapButton compact event={event} />
            {canCall ? (
              <IconButton
                accessibilityLabel="Sună clientul"
                backgroundColor={theme.colors.redSoft}
                icon="call-outline"
                onPress={() => openContact('call', event.contact_phone)}
              />
            ) : null}
            {canWhatsApp ? (
              <IconButton
                accessibilityLabel="Deschide WhatsApp"
                backgroundColor={theme.colors.surface}
                color={theme.colors.success}
                icon="logo-whatsapp"
                onPress={() => openContact('whatsapp', event.contact_phone)}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.lg },
  row: { flexDirection: 'row' },
  details: { flex: 1, minWidth: 0 },
  location: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  address: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  schedule: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  actions: { gap: theme.spacing.sm, marginLeft: theme.spacing.sm },
});
