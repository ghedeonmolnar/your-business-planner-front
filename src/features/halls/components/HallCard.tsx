import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Hall } from '@/features/halls/types';
import { HallPhoto } from '@/features/halls/components/HallPhoto';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { Card } from '@/shared/components/Card';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';

export function HallCard({ hall, onOpen }: { hall: Hall; onOpen: () => void }) {
  return (
    <Card
      style={styles.listCard}
      onPress={onOpen}
      accessibilityLabel={`Deschide sala ${hall.name}, ${hall.is_active ? 'activă' : 'inactivă'}, ${hall.capacity} persoane`}
    >
      <View style={styles.thumbnail}>
        <HallPhoto
          uri={hall.images[0]?.url ?? null}
          label={`Imagine ${hall.name}`}
        />
      </View>
      <View style={styles.labels}>
        <Text style={styles.sectionTitle}>{hall.name}</Text>
        <Text style={styles.subtitle}>
          {hall.capacity.toLocaleString('ro-RO')} persoane
        </Text>
        <MetaPill
          label={hall.is_active ? 'Activă' : 'Inactivă'}
          tone={hall.is_active ? 'success' : 'neutral'}
        />
      </View>
      <Ionicons
        accessible={false}
        name="chevron-forward"
        size={theme.typography.sectionTitle}
        color={theme.colors.menu.text}
      />
    </Card>
  );
}
