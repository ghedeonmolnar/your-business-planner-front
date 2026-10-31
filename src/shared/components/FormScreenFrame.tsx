import React, { useRef, useState, useSyncExternalStore } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { onlineManager } from '@tanstack/react-query';
import { Text } from 'react-native-paper';
import { Screen } from '@/shared/components/Screen';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';
import {
  FormFocusContext,
  FormInteractionContext,
} from '@/shared/components/FormInteractionContext';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showMessage } from '@/shared/feedback/showMessage';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { theme } from '@/shared/theme/theme';

type FormScreenFrameProps = {
  title: string;
  subtitle?: string;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  busy?: boolean;
  hasUnsavedChanges?: boolean;
};

const subscribeToOnlineStatus = (listener: () => void) =>
  onlineManager.subscribe(listener);
const getOnlineStatus = () => onlineManager.isOnline();

export function FormScreenFrame({
  title,
  subtitle,
  tabs,
  children,
  footer,
  busy = false,
  hasUnsavedChanges = false,
}: FormScreenFrameProps) {
  const navigation = useNavigation();
  const online = useSyncExternalStore(subscribeToOnlineStatus, getOnlineStatus);
  const [generation] = useState(getSessionGeneration);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollOffset = useRef(0);
  usePreventRemove(busy || hasUnsavedChanges, ({ data }) => {
    if (generation !== getSessionGeneration()) return;
    if (busy) {
      showMessage('Salvare în curs', 'Așteaptă încheierea salvării.');
      return;
    }
    confirmAction({
      title: 'Renunți la modificări?',
      message: 'Modificările nesalvate se vor pierde.',
      confirmLabel: 'Renunță',
      cancelLabel: 'Continuă editarea',
      destructive: true,
      onConfirm: () => {
        if (generation === getSessionGeneration())
          navigation.dispatch(data.action);
      },
    });
  });
  const revealFocusedInput = () => {
    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;
    scrollRef.current?.measureInWindow((_x, top, _width, height) => {
      input.measureInWindow((_inputX, inputTop, _inputWidth, inputHeight) => {
        const overflow =
          inputTop + inputHeight + theme.spacing.md - top - height;
        if (overflow > 0)
          scrollRef.current?.scrollTo({
            y: scrollOffset.current + overflow,
            animated: true,
          });
      });
    });
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.fill}
    >
      <Screen>
        <View style={styles.header}>
          <ContentSection
            title={title}
            subtitle={subtitle}
            size="page"
            titleStyle={styles.title}
            leading={
              <IconButton
                icon="arrow-back"
                accessibilityLabel="Înapoi"
                disabled={busy}
                onPress={() => navigation.goBack()}
              />
            }
          />
          {tabs}
          {!online ? (
            <Text accessibilityRole="alert" style={styles.notice}>
              Ești offline. Modificările rămân în formular până revine
              conexiunea.
            </Text>
          ) : null}
        </View>
        <FormInteractionContext.Provider value={busy}>
          <ScrollView
            ref={scrollRef}
            style={styles.fill}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onLayout={revealFocusedInput}
            onContentSizeChange={revealFocusedInput}
            onScroll={event => {
              scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            <FormFocusContext.Provider value={revealFocusedInput}>
              {children}
            </FormFocusContext.Provider>
          </ScrollView>
        </FormInteractionContext.Provider>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: { fontSize: theme.typography.title },
  notice: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  content: { padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.lg },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
