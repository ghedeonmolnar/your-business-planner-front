import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Hall } from '@/features/halls/types';
import { hallNumber } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { MetaPill } from '@/shared/components/MetaPill';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';

export function HallSummary({ hall }: { hall: Hall }) {
  const metrics: { icon: IconName; value: string; label: string }[] = [
    {
      icon: 'people-outline',
      value: hallNumber(hall.capacity),
      label: 'capacitate maximă',
    },
    {
      icon: 'person-outline',
      value: hallNumber(hall.minimum_guests),
      label: 'minim invitați implicit',
    },
    {
      icon: 'calendar-outline',
      value: hallNumber(hall.future_bookings_count),
      label: 'rezervări viitoare',
    },
  ];
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text accessibilityRole="header" style={[styles.title, styles.flex]}>
          {hall.name}
        </Text>
        <MetaPill
          label={hall.is_active ? 'Activă' : 'Inactivă'}
          tone={hall.is_active ? 'success' : 'neutral'}
        />
      </View>
      <View style={styles.metrics}>
        {metrics.map(metric => (
          <View key={metric.label} style={styles.metric}>
            <Ionicons
              accessible={false}
              name={metric.icon}
              color={theme.colors.menu.primary}
              size={theme.typography.title}
            />
            <Text style={styles.sectionTitle}>{metric.value}</Text>
            <Text style={styles.subtitle}>{metric.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.divider}>
        <Text style={styles.subtitle}>
          Minimul comercial este propus pentru rezervările noi. Condițiile
          rezervărilor existente rămân cele contractate.
        </Text>
      </View>
      {hall.area_sqm !== null ? (
        <Text style={styles.body}>
          Suprafață: {hallNumber(hall.area_sqm)} m²
        </Text>
      ) : null}
      {hall.arrangement ? (
        <Text style={styles.body}>Aranjament: {hall.arrangement}</Text>
      ) : null}
      <Text style={styles.body}>
        {hall.description || 'Nu există o descriere a sălii.'}
      </Text>
      {hall.address ? (
        <Text style={styles.subtitle}>{hall.address}</Text>
      ) : null}
      {!hall.is_active ? (
        <Text style={styles.subtitle}>
          Sala este inactivă pentru rezervări noi. Rezervările existente se
          păstrează.
        </Text>
      ) : null}
    </Card>
  );
}
