import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Mascot } from '@/features/mascots/types';
import { Card } from '@/shared/components/Card';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';

type MascotCardProps = {
  mascot: Mascot;
  onDetails: (mascot: Mascot) => void;
  onEdit: (mascot: Mascot) => void;
  onDelete: (mascot: Mascot) => void;
};

export function MascotCard({
  mascot,
  onDetails,
  onEdit,
  onDelete,
}: MascotCardProps) {
  const price = Math.round(Number(mascot.price_per_hour) || 0);

  return (
    <Card
      style={[styles.card, !mascot.is_active ? styles.inactiveCard : undefined]}
    >
      <View style={styles.cardMain}>
        <TouchableOpacity
          accessibilityLabel={`Deschide profilul mascotei ${mascot.name}`}
          accessibilityRole="button"
          activeOpacity={0.72}
          onPress={() => onDetails(mascot)}
          style={styles.profileButton}
        >
          <View style={styles.avatar}>
            {mascot.image_url ? (
              <Image source={{ uri: mascot.image_url }} style={styles.image} />
            ) : (
              <Ionicons
                name="sparkles-outline"
                size={24}
                color={theme.colors.accent}
              />
            )}
          </View>
          <View style={styles.mascotInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{mascot.name}</Text>
              {!mascot.is_active ? (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveText}>Inactivă</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.rateText}>{price} lei/h</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <EditIconButton
            accessibilityLabel={`Editează mascota ${mascot.name}`}
            onPress={() => onEdit(mascot)}
          />
          <IconButton
            accessibilityLabel={
              mascot.is_active
                ? `Șterge mascota ${mascot.name}`
                : `Șterge definitiv mascota ${mascot.name}`
            }
            backgroundColor={theme.colors.redSoft}
            color={theme.colors.danger}
            icon={mascot.is_active ? 'trash-outline' : 'trash'}
            onPress={() => onDelete(mascot)}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  inactiveCard: {
    opacity: 0.72,
  },
  cardMain: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.orangeSoft,
    borderRadius: theme.radius.lg,
    height: 54,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    width: 54,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  mascotInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    marginRight: theme.spacing.sm,
  },
  rateText: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.redSoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  inactiveText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
