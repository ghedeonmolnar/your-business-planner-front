import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Dialog, Surface, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconName } from '@/shared/types/icon';
import { AppButton } from '@/shared/components/AppButton';
import { theme } from '@/shared/theme/theme';
import { useDialogLayout } from '@/shared/hooks/useDialogLayout';

const DIALOG_MAX_WIDTH = 420;

export type AppDialogContent = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
  tone?: 'success' | 'warning';
  centered?: boolean;
};

type AppDialogProps = {
  dialog: AppDialogContent | null;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

export function AppDialog({
  dialog,
  onCancel,
  onConfirm,
  busy = false,
}: AppDialogProps) {
  const { modalMaxHeight, overlayInsets } = useDialogLayout(
    dialog !== null,
    'confirmation',
  );
  const cancel = () => {
    if (!busy) onCancel();
  };
  const content = dialog;
  const actionLabels = content
    ? [content.confirmLabel, content.cancelLabel].filter(
        (actionLabel): actionLabel is string => Boolean(actionLabel),
      )
    : [];

  return (
    <Modal
      animationType="fade"
      onRequestClose={cancel}
      statusBarTranslucent
      transparent
      visible={dialog !== null}
    >
      <View style={[styles.overlay, overlayInsets]}>
        <Pressable
          accessible={false}
          onPress={cancel}
          disabled={busy}
          style={styles.backdrop}
        />
        {content ? (
          <Surface
            accessibilityViewIsModal
            elevation={3}
            style={[styles.panel, { maxHeight: modalMaxHeight }]}
          >
            {content.icon ? (
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={[
                  styles.icon,
                  {
                    borderColor:
                      content.tone === 'warning'
                        ? theme.colors.menu.invitations
                        : theme.colors.menu.success,
                  },
                ]}
              >
                <Ionicons
                  name={content.icon}
                  size={theme.spacing.xxl}
                  color={
                    content.tone === 'warning'
                      ? theme.colors.menu.invitations
                      : theme.colors.menu.success
                  }
                />
              </View>
            ) : null}
            <Dialog.Title
              accessibilityRole="header"
              style={[
                styles.title,
                content.centered ? styles.centeredText : undefined,
              ]}
            >
              {content.title}
            </Dialog.Title>
            <ScrollView style={styles.messageScroll}>
              <Dialog.Content>
                <Text
                  style={[
                    styles.message,
                    content.centered ? styles.centeredText : undefined,
                  ]}
                >
                  {content.message}
                </Text>
              </Dialog.Content>
            </ScrollView>
            <Dialog.Actions
              style={[
                styles.actions,
                content.centered ? styles.centeredActions : undefined,
              ]}
            >
              <AppButton
                label={content.confirmLabel}
                variant={content.destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
                loading={busy}
                multiline={content.centered}
                size="large"
                sizingLabels={content.centered ? undefined : actionLabels}
                style={[
                  styles.action,
                  content.centered ? styles.centeredAction : undefined,
                ]}
              />
              {content.cancelLabel ? (
                <AppButton
                  label={content.cancelLabel}
                  onPress={onCancel}
                  disabled={busy}
                  multiline={content.centered}
                  size="large"
                  sizingLabels={content.centered ? undefined : actionLabels}
                  style={[
                    styles.action,
                    content.centered ? styles.centeredAction : undefined,
                  ]}
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
    paddingHorizontal: theme.spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.overlay,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    flexShrink: 1,
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
  centeredText: { textAlign: 'center' },
  centeredActions: { flexDirection: 'column', alignItems: 'stretch' },
  centeredAction: { width: '100%' },
  icon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: theme.spacing.xxl * 2,
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    width: theme.spacing.xxl * 2,
  },
});
