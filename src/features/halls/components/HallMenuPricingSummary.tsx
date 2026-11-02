import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Hall } from '@/features/halls/types';
import { hallWeekdays } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { formatShortDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export function HallMenuPricingSummary({ hall }: { hall: Hall }) {
  if (hall.menu_pricing_mode !== 'advanced') return null;
  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>Prețuri pe perioade și zile</Text>
      <Text style={styles.subtitle}>
        În afara regulilor se folosesc prețurile de bază afișate mai sus.
      </Text>
      {hall.menu_price_rules?.map(rule => (
        <View
          key={`${rule.name}:${rule.starts_on}:${rule.weekdays.join(',')}`}
          style={styles.divider}
        >
          <Text style={styles.body}>{rule.name}</Text>
          <Text style={styles.subtitle}>
            {formatShortDate(rule.starts_on)} – {formatShortDate(rule.ends_on)}{' '}
            · {rule.weekdays.map(day => hallWeekdays[day]).join(', ')}
          </Text>
          <Text style={styles.body}>
            Adulți: {formatExactMoney(rule.menu_price)} · Copii:{' '}
            {formatExactMoney(rule.child_menu_price)}
          </Text>
        </View>
      ))}
    </View>
  );
}
