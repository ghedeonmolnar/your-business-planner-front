import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { buildContactUrl, openContact } from '@/shared/utils/contactLinks';
import { Card } from '@/shared/components/Card';
import { IconButton } from '@/shared/components/IconButton';
import { MetaPill } from '@/shared/components/MetaPill';
import { formatEventDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

export function EmployeeEventCard({
  event,
  onDetails,
}: {
  event: EmployeeEvent;
  onDetails?: (event: EmployeeEvent) => void;
}) {
  const canCall = Boolean(buildContactUrl('call', event.contact_phone));
  const canWhatsApp = Boolean(buildContactUrl('whatsapp', event.contact_phone));
  const earningsLabel =
    event.earnings !== null
      ? `Câștig: ${formatExactMoney(event.earnings)}`
      : event.projected_earnings !== null
        ? `Câștig estimat: ${formatExactMoney(event.projected_earnings)}`
        : null;

  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityLabel={
          onDetails ? `Detalii eveniment ${event.location ?? ''}` : undefined
        }
        accessibilityRole={onDetails ? 'button' : undefined}
        disabled={!onDetails}
        onPress={onDetails ? () => onDetails(event) : undefined}
      >
        <Text style={styles.title}>
          {event.location ?? 'Locație necompletată'}
        </Text>
        <Text style={styles.detail}>
          {formatEventDate(event.date, event.start_time, event.end_time)}
        </Text>
        {event.address ? (
          <Text style={styles.detail}>{event.address}</Text>
        ) : null}
        {event.type_label ? (
          <Text style={styles.detail}>Tip: {event.type_label}</Text>
        ) : null}
        {event.client_name ? (
          <Text style={styles.detail}>Client: {event.client_name}</Text>
        ) : null}
        {event.coworkers.length ? (
          <Text style={styles.detail}>
            Colegi: {event.coworkers.map(person => person.name).join(', ')}
          </Text>
        ) : null}
        <View style={styles.pills}>
          <MetaPill
            color={
              event.status === 'cancelled'
                ? theme.colors.danger
                : theme.colors.primary
            }
            label={event.status_label}
          />
          {event.mascot ? <MetaPill label={event.mascot.name} /> : null}
          {earningsLabel ? (
            <MetaPill label={earningsLabel} color={theme.colors.success} />
          ) : null}
        </View>
      </Pressable>
      {canCall || canWhatsApp ? (
        <View style={styles.actions}>
          {canCall ? (
            <IconButton
              accessibilityLabel="Sună clientul"
              icon="call-outline"
              onPress={() => openContact('call', event.contact_phone)}
            />
          ) : null}
          {canWhatsApp ? (
            <IconButton
              accessibilityLabel="Deschide WhatsApp"
              color={theme.colors.success}
              icon="logo-whatsapp"
              onPress={() => openContact('whatsapp', event.contact_phone)}
            />
          ) : null}
        </View>
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
  },
  detail: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
});
