import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { Card } from '@/shared/components/Card';
import { IconButton } from '@/shared/components/IconButton';
import { AppButton } from '@/shared/components/AppButton';
import { MetaPill } from '@/shared/components/MetaPill';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';

export function DirectoryCard({
  item,
  kind,
  onEdit,
  onHistory,
}: {
  item: DirectoryItem;
  kind: DirectoryKind;
  onEdit: () => void;
  onHistory: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.between}>
        <Text style={[styles.subtitle, styles.grow]}>{item.name}</Text>
        <IconButton
          icon="create-outline"
          accessibilityLabel={'Editează ' + item.name}
          onPress={onEdit}
        />
      </View>
      {kind === 'clients' ? (
        <>
          <Text style={styles.muted}>
            {item.phone || 'Telefon necompletat'}
          </Text>
          {item.notes ? (
            <Text numberOfLines={2} style={styles.text}>
              {item.notes}
            </Text>
          ) : null}
          <AppButton
            label="Vezi rezervările"
            icon="time-outline"
            variant="ghost"
            onPress={onHistory}
          />
        </>
      ) : (
        <>
          {kind === 'halls' ? (
            <Text style={styles.text}>
              {item.capacity ?? 0} persoane
              {item.address ? ' · ' + item.address : ''}
            </Text>
          ) : (
            <Text style={styles.text}>
              {staffRoleOptions.find(role => role.id === item.job_role)?.name ??
                'Personal'}
            </Text>
          )}
          <MetaPill label={item.is_active === false ? 'Inactivă' : 'Activă'} />
        </>
      )}
    </Card>
  );
}
