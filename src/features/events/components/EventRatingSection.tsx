import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';

type EventRatingSectionProps = {
  rating?: number | null;
  notes?: string | null;
};

export function EventRatingSection({ rating, notes }: EventRatingSectionProps) {
  return (
    <View>
      {rating ? (
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Recenzie lăsată</Text>
          <MetaPill icon="star" label={`Nota ${rating}/5`} />
        </View>
      ) : null}
      {notes?.trim() ? (
        <>
          <Text style={styles.notesLabel}>Note</Text>
          <Text style={styles.notes}>{notes.trim()}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  notesLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.md,
  },
  notes: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
});
