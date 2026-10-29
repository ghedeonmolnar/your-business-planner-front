import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  TextInput,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { IconButton } from '@/shared/components/IconButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { useDialogLayout } from '@/shared/hooks/useDialogLayout';
import { theme } from '@/shared/theme/theme';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';

import { formModalStyles as styles } from '@/shared/components/formModalStyles';

type FormModalFrameProps = {
  visible: boolean;
  title: string;
  progress?: { current: number; total: number };
  onClose: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hasUnsavedChanges?: boolean;
  closeLabel?: string;
  busy?: boolean;
  readOnly?: boolean;
  size?: 'form' | 'time';
};

type ScrollViewport = {
  offsetTop: number;
  height: number;
};

export function FormModalFrame({
  visible,
  title,
  progress,
  onClose,
  onDismiss,
  children,
  footer,
  hasUnsavedChanges = false,
  busy = false,
  readOnly = false,
  size = 'form',
  closeLabel = 'Închide formularul',
}: FormModalFrameProps) {
  const { modalTop, modalMaxHeight, overlayInsets } = useDialogLayout(
    visible,
    size,
  );
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollOffsetRef = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const scrollViewportRef = useRef<ScrollViewport>({
    offsetTop: 0,
    height: 0,
  });

  const scrollChrome =
    headerHeight > 0 &&
    modalMaxHeight < headerHeight + footerHeight + theme.controls.fieldHeight;
  const header = (
    <View
      onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}
      style={[styles.header, scrollChrome ? styles.embedded : undefined]}
    >
      <Text
        accessibilityRole="header"
        accessibilityLabel={
          progress
            ? `${title}, pasul ${progress.current} din ${progress.total}`
            : title
        }
        style={styles.title}
      >
        {title}
        {progress ? (
          <Text style={styles.progress}>
            {` ${progress.current}/${progress.total}`}
          </Text>
        ) : null}
      </Text>
      <IconButton
        accessibilityLabel={closeLabel}
        icon="close"
        disabled={busy}
        onPress={() => requestClose()}
      />
    </View>
  );
  const actions = footer ? (
    <View
      onLayout={event => setFooterHeight(event.nativeEvent.layout.height)}
      style={[styles.footer, scrollChrome ? styles.embedded : undefined]}
    >
      {footer}
    </View>
  ) : null;

  const revealFocusedInput = () => {
    const focusedInput = TextInput.State.currentlyFocusedInput();
    const { offsetTop, height } = scrollViewportRef.current;

    if (!focusedInput || !height) {
      return;
    }

    const viewportBottom = modalTop + offsetTop + height;

    focusedInput.measureInWindow((_x, inputTop, _width, inputHeight) => {
      const hiddenHeight =
        inputTop + inputHeight + theme.spacing.md - viewportBottom;

      if (hiddenHeight <= 0) {
        return;
      }

      scrollRef.current?.scrollTo({
        y: scrollOffsetRef.current + hiddenHeight,
        animated: true,
      });
    });
  };

  const handleScrollLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const previousHeight = scrollViewportRef.current.height;

    scrollViewportRef.current = { offsetTop: y, height };

    if (height < previousHeight) {
      revealFocusedInput();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const requestClose = () => {
    if (busy) {
      return;
    }
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    confirmAction({
      destructive: true,
      title: 'Modificări nesalvate',
      message:
        'Dacă pleci acum, datele completate și modificările nesalvate se vor pierde.',
      confirmLabel: 'Pleacă fără să salvezi',
      cancelLabel: 'Rămâi în formular',
      onConfirm: onClose,
    });
  };

  return (
    <Modal
      animationType="slide"
      onDismiss={onDismiss}
      onRequestClose={requestClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        style={[
          styles.overlay,
          size === 'time' ? styles.centered : undefined,
          overlayInsets,
        ]}
      >
        <Surface
          elevation={2}
          style={[styles.content, { maxHeight: modalMaxHeight }]}
        >
          {scrollChrome ? null : header}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
            keyboardShouldPersistTaps="handled"
            onLayout={handleScrollLayout}
            onScroll={handleScroll}
            ref={scrollRef}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {scrollChrome ? header : null}
            <FormInteractionContext.Provider value={busy || readOnly}>
              <View pointerEvents={busy || readOnly ? 'none' : 'auto'}>
                {children}
              </View>
            </FormInteractionContext.Provider>
            {scrollChrome ? actions : null}
          </ScrollView>

          {scrollChrome ? null : actions}
        </Surface>
      </View>
      {visible ? <DialogHost /> : null}
    </Modal>
  );
}
