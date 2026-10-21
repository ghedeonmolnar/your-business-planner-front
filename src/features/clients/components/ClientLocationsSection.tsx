import React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { Client } from '@/features/clients/types';
import { clientDetailsStyles as styles } from '@/features/clients/components/clientDetailsStyles';
import { Card } from '@/shared/components/Card';
import { formatLongDate } from '@/shared/utils/formatDate';

export function ClientLocationsSection({ client }: { client: Client }) {
  return (
    <Card style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        Locații cunoscute
      </Text>
      {client.locations?.length ? (
        client.locations.map(location => (
          <View key={location.id} style={styles.entry}>
            <Text style={styles.value}>
              {location.location || 'Locație necompletată'}
            </Text>
            <Text style={styles.emptyText}>
              {location.address || 'Adresă necompletată'}
            </Text>
            <Text style={styles.label}>
              Ultimul eveniment:{' '}
              {formatLongDate(location.last_event_date) || 'Data necunoscută'}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nu există locații salvate.</Text>
      )}
    </Card>
  );
}
