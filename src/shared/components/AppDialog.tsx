import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Dialog, Surface, Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';

const DIALOG_MAX_WIDTH = 420;

export type AppDialogContent = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
};

type AppDialogProps = {
  dialog: AppDialogContent | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppDialog({ dialog, onCancel, onConfirm }: AppDialogProps) {
  const content = dialog;
  const actionLabels = content
    ? [content.confirmLabel, content.cancelLabel].filter(
        (actionLabel): actionLabel is string => Boolean(actionLabel),
      )
    : [];

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={dialog !== null}
    >
      <View style={styles.overlay}>
        <Pressable
          accessible={false}
          onPress={onCancel}
          style={styles.backdrop}
        />
        {content ? (
          <Surface accessibilityViewIsModal elevation={3} style={styles.panel}>
            <Dialog.Title accessibilityRole="header" style={styles.title}>
              {content.title}
            </Dialog.Title>
            <ScrollView style={styles.messageScroll}>
              <Dialog.Content>
                <Text style={styles.message}>{content.message}</Text>
              </Dialog.Content>
            </ScrollView>
            <Dialog.Actions style={styles.actions}>
              <AppButton
                label={content.confirmLabel}
                onPress={onConfirm}
                size="large"
                sizingLabels={actionLabels}
                style={styles.action}
              />
              {content.cancelLabel ? (
                <AppButton
                  label={content.cancelLabel}
                  onPress={onCancel}
                  size="large"
                  sizingLabels={actionLabels}
                  style={styles.action}
                  variant="outline"
                />
              ) : null}
            </Dialog.Actions>
          </Surface>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.overlay,
  },
  panel: {
    borderRadius: theme.radius.lg,
    flexShrink: 1,
    maxHeight: '90%',
    maxWidth: DIALOG_MAX_WIDTH,
    width: '100%',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.sectionTitle,
  },
  message: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
  },
  messageScroll: { flexGrow: 0, flexShrink: 1 },
  actions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
  },
  action: { flexGrow: 1 },
});
