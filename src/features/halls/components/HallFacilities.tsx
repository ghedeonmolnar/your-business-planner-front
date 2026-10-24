import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Hall } from '@/features/halls/types';
import { hallAmenityIcon } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

export function HallFacilities({
  hall,
  onEdit,
}: {
  hall: Hall;
  onEdit?: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionTitle, styles.flex]}
        >
          Facilități
        </Text>
        {!hall.amenities.length && onEdit ? (
          <AppButton
            label="Editează"
            variant="ghost"
            size="small"
            onPress={onEdit}
          />
        ) : null}
      </View>
      {hall.amenities.length ? (
        <View style={styles.row}>
          {hall.amenities.map(name => (
            <View key={name} style={styles.amenity}>
              <Ionicons
                accessible={false}
                name={hallAmenityIcon(name)}
                color={theme.colors.menu.primary}
                size={theme.typography.title}
              />
              <Text style={[styles.body, styles.flex]}>{name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.subtitle}>Nu sunt configurate facilități.</Text>
      )}
    </Card>
  );
}
