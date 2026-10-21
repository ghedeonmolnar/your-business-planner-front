import React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { Client } from '@/features/clients/types';
import { clientDetailsStyles as styles } from '@/features/clients/components/clientDetailsStyles';
import { Card } from '@/shared/components/Card';
import { formatLongDate } from '@/shared/utils/formatDate';

export function ClientProfileSummary({
  client,
  sourceLabel,
}: {
  client: Client;
  sourceLabel: string;
}) {
  const address = [client.strada, client.oras, client.judet]
    .filter(Boolean)
    .join(', ');

  return (
    <Card style={styles.section}>
      <Text accessibilityRole="header" style={styles.name}>
        {client.name}
      </Text>
      <Detail label="Adresă" value={address || 'Adresă necompletată'} />
      <Detail label="Sursă" value={sourceLabel} />
      <Detail
        label="Ultimul contract"
        value={
          formatLongDate(client.last_contract_date) ||
          'Nu există o dată salvată'
        }
      />
      <Detail
        label="Notițe"
        value={client.notes?.trim() || 'Nu există notițe salvate.'}
      />
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
