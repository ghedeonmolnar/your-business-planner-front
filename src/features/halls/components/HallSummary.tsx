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
import { formatExactMoney } from '@/shared/utils/money';

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
          Minimul sălii se aplică rezervărilor noi. Prețurile de mai jos sunt
          precompletate și pot fi negociate la rezervare. Condițiile existente
          se păstrează.
        </Text>
      </View>
      <Text style={styles.body}>
        Meniu adulți:{' '}
        {hall.menu_price == null
          ? 'Preț neconfigurat'
          : formatExactMoney(hall.menu_price)}
      </Text>
      <Text style={styles.body}>
        Meniu copii:{' '}
        {hall.child_menu_price == null
          ? 'Preț neconfigurat'
          : formatExactMoney(hall.child_menu_price)}
      </Text>
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
