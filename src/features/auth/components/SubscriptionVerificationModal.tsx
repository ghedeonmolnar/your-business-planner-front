import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LoadingState } from '@/shared/components/LoadingState';
import { theme } from '@/shared/theme/theme';

export function SubscriptionVerificationModal({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <Modal visible={visible} onRequestClose={() => undefined}>
      <View style={styles.content} accessibilityViewIsModal>
        <LoadingState />
        <Text style={styles.text}>
          Verificăm perioada abonamentului. Formularele tale sunt păstrate. Dacă
          ești offline, reconectează-te; verificarea se reia automat.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  text: { color: theme.colors.text, fontSize: theme.typography.body },
});
