import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

const stepLabels = ['Detalii', 'Program', 'Animatori'];

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <View style={styles.stepIndicator}>
      {stepLabels.map((label, index) => {
        const step = index + 1;
        const active = step <= currentStep;

        return (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                active ? styles.stepDotActive : undefined,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  active ? styles.stepNumberActive : undefined,
                ]}
              >
                {step}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                active ? styles.stepLabelActive : undefined,
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.meta,
  },
  stepNumberActive: {
    color: theme.colors.surface,
  },
  stepLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
    marginTop: theme.spacing.xs,
  },
  stepLabelActive: {
    color: theme.colors.primary,
  },
});
