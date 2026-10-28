import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Event } from '@/features/events/types';
import { useEventMapMutations } from '@/features/events/hooks/useEventMapLocation';
import { useAuth } from '@/features/auth/AuthProvider';
import { AppButton } from '@/shared/components/AppButton';
import { Card } from '@/shared/components/Card';
import { EventMapButton } from '@/shared/components/EventMapButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { theme } from '@/shared/theme/theme';

export function EventMapSection({
  event,
  onEdit,
}: {
  event: Event;
  onEdit: () => void;
}) {
  const { user } = useAuth();
  const { remove } = useEventMapMutations(event.id);
  const point = event.map_location;
  const deletePoint = () =>
    confirmAction({
      title: 'Ștergi locația de pe hartă?',
      message: 'Locația și adresa scrise în rezervare se păstrează.',
      confirmLabel: 'Șterge pinul',
      onConfirm: async () => {
        try {
          await remove.mutateAsync();
        } catch (error) {
          showError(error, 'Nu am putut șterge pinul.');
        }
      },
    });

  return (
    <Card style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>
        Locație
      </Text>
      {point && !point.confirmed ? (
        <Text style={styles.text}>
          Adresa s-a schimbat. Verifică și reconfirmă locația pe hartă.
        </Text>
      ) : null}
      <EventMapButton event={event} />
      {user?.role === 'admin' ? (
        <>
          <AppButton
            disabled={remove.isPending}
            icon="location-outline"
            label={
              point
                ? 'Modifică locația pe hartă'
                : 'Stabilește locația pe hartă'
            }
            multiline
            onPress={onEdit}
            variant="outline"
          />
          {point ? (
            <AppButton
              disabled={remove.isPending}
              icon="trash-outline"
              label={remove.isPending ? 'Se șterge pinul…' : 'Șterge pinul'}
              loading={remove.isPending}
              multiline
              onPress={deletePoint}
              variant="danger"
            />
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  text: { color: theme.colors.text, fontSize: theme.typography.body },
});
