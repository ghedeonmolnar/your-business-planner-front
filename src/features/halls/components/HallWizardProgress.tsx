import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { hallWizardStyles as styles } from '@/features/halls/components/hallWizardStyles';
import { theme } from '@/shared/theme/theme';

export function HallWizardProgress({ step }: { step: number }) {
  return (
    <View style={styles.steps} accessibilityLabel={`Pasul ${step + 1} din 3`}>
      {['Date principale', 'Prețuri meniu', 'Detalii finale'].map(
        (label, index) => (
          <View key={label} style={styles.step}>
            {index < 2 ? (
              <View
                style={[styles.stepLine, index < step && styles.completedLine]}
              />
            ) : null}
            <View
              style={[styles.stepCircle, index <= step && styles.activeCircle]}
            >
              {index < step ? (
                <Ionicons
                  name="checkmark"
                  color={theme.colors.menu.surface}
                  size={theme.typography.sectionTitle}
                />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index === step && styles.activeNumber,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[styles.stepLabel, index === step && styles.activeLabel]}
            >
              {label}
            </Text>
          </View>
        ),
      )}
    </View>
  );
}
