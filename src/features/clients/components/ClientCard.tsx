import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Client } from '@/features/clients/types';
import { Card } from '@/shared/components/Card';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';
import { openContact } from '@/shared/utils/contactLinks';

type ClientCardProps = {
  client: Client;
  sourceLabels: ReadonlyMap<string, string>;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onDetails: (client: Client) => void;
};

export function ClientCard({
  client,
  sourceLabels,
  onEdit,
  onDelete,
  onDetails,
}: ClientCardProps) {
  const primaryPhone =
    client.primary_contact?.kind === 'phone'
      ? client.primary_contact.value
      : client.phone;
  const latestLocation = client.latest_location;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        accessibilityLabel={`Vezi detaliile clientului ${client.name}`}
        accessibilityRole="button"
        activeOpacity={0.72}
        onPress={() => onDetails(client)}
        style={styles.cardMain}
      >
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={22}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.address}>
            {latestLocation?.location ??
              ([client.oras, client.judet].filter(Boolean).join(', ') ||
                'Fără locație')}
          </Text>
          {client.source ? (
            <Text style={styles.source}>
              Sursă: {sourceLabels.get(client.source) ?? client.source}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        {primaryPhone ? (
          <>
            <IconButton
              accessibilityLabel="Sună clientul"
              color={theme.colors.primary}
              icon="call-outline"
              onPress={() => {
                openContact('call', primaryPhone);
              }}
            />
            <IconButton
              accessibilityLabel="Deschide WhatsApp"
              backgroundColor={theme.colors.surface}
              color={theme.colors.success}
              icon="logo-whatsapp"
              onPress={() => {
                openContact('whatsapp', primaryPhone);
              }}
              style={styles.actionSpacing}
            />
          </>
        ) : null}
        <IconButton
          accessibilityLabel="Vezi istoricul clientului"
          icon="receipt-outline"
          onPress={() => onDetails(client)}
          style={primaryPhone ? styles.actionSpacing : undefined}
        />
        <EditIconButton
          accessibilityLabel="Editează clientul"
          onPress={() => onEdit(client)}
          style={styles.actionSpacing}
        />
        <IconButton
          accessibilityLabel="Șterge clientul"
          backgroundColor={theme.colors.redSoft}
          color={theme.colors.danger}
          icon="trash-outline"
          onPress={() => onDelete(client)}
          style={styles.actionSpacing}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  cardMain: {
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.blueSoft,
    borderRadius: theme.radius.lg,
    height: 44,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 44,
  },
  clientInfo: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
  address: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
  source: {
    color: theme.colors.warning,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  actionSpacing: {
    marginLeft: theme.spacing.sm,
  },
});
