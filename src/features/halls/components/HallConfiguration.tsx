import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Hall } from '@/features/halls/types';
import { hallWeekdays } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';

export function HallConfiguration({
  hall,
  onAvailability,
}: {
  hall: Hall;
  onAvailability: () => void;
}) {
  return (
    <>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionTitle, styles.flex]}
          >
            Program standard
          </Text>
          <AppButton
            label="Vezi calendar"
            variant="ghost"
            size="small"
            onPress={onAvailability}
            multiline
          />
        </View>
        {hall.business_hours.length ? (
          hallWeekdays.map((day, weekday) => {
            const hours = hall.business_hours.find(
              item => item.weekday === weekday,
            );
            return (
              <View key={day} style={styles.row}>
                <Text style={[styles.body, styles.flex]}>{day}</Text>
                <Text style={styles.body}>
                  {hours
                    ? `${hours.start_time} – ${hours.end_time}${hours.ends_next_day ? ' (+1 zi)' : ''}`
                    : 'Nespecificat'}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.subtitle}>Programul nu este configurat.</Text>
        )}
        <Text style={styles.subtitle}>
          Program orientativ. Verifică disponibilitatea în calendar; rezervările
          pot trece în ziua următoare.
        </Text>
      </Card>
      {hall.setup_minutes !== null || hall.cleanup_minutes !== null ? (
        <Card style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Organizare
          </Text>
          {hall.setup_minutes !== null ? (
            <Text style={styles.body}>
              Pregătire: {hall.setup_minutes} minute
            </Text>
          ) : null}
          {hall.cleanup_minutes !== null ? (
            <Text style={styles.body}>
              Eliberare: {hall.cleanup_minutes} minute
            </Text>
          ) : null}
          <Text style={styles.subtitle}>
            Repere de organizare; nu blochează automat calendarul.
          </Text>
        </Card>
      ) : null}
      <Card style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Note interne
        </Text>
        <Text style={styles.subtitle}>
          Vizibile echipei de administrare. Nu se trimit clientului.
        </Text>
        <Text style={styles.body}>
          {hall.internal_notes || 'Nu există note interne.'}
        </Text>
      </Card>
    </>
  );
}
