import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { EventFormStep } from '@/features/events/components/eventForm/eventFormConfig';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

type EventFormFooterProps = {
  currentStep: EventFormStep;
  isEdit: boolean;
  knownClientEventsCount: number;
  onBack: () => void;
  onContinue: () => void;
  saving: boolean;
};

export function EventFormFooter({
  currentStep,
  isEdit,
  knownClientEventsCount,
  onBack,
  onContinue,
  saving,
}: EventFormFooterProps) {
  const label =
    currentStep === 3
      ? saving
        ? 'Se salvează...'
        : isEdit
          ? 'Salvează'
          : 'Creează'
      : 'Înainte';

  return (
    <View>
      {knownClientEventsCount > 0 ? (
        <Text style={styles.knownClientHint}>
          Ai mai interacționat cu această persoană. ({knownClientEventsCount})
        </Text>
      ) : null}
      <View style={styles.row}>
        {currentStep > 1 ? (
          <AppButton
            disabled={saving}
            label="Înapoi"
            onPress={onBack}
            style={styles.button}
            variant="outline"
          />
        ) : null}
        <AppButton
          disabled={saving}
          label={label}
          onPress={onContinue}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
  },
  knownClientHint: {
    color: theme.colors.success,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
