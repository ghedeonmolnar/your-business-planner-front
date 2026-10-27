import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  TextInput,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/shared/components/IconButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { theme } from '@/shared/theme/theme';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';

import { formModalStyles as styles } from '@/shared/components/formModalStyles';

const MODAL_HEIGHT_RATIO = 0.9;

type FormModalFrameProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hasUnsavedChanges?: boolean;
  fitContent?: boolean;
  closeLabel?: string;
  busy?: boolean;
  readOnly?: boolean;
};

type ScrollViewport = {
  offsetTop: number;
  height: number;
};

export function FormModalFrame({
  visible,
  title,
  onClose,
  onDismiss,
  children,
  footer,
  hasUnsavedChanges = false,
  fitContent = false,
  busy = false,
  readOnly = false,
  closeLabel = 'Închide formularul',
}: FormModalFrameProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardOverlap = useKeyboardOverlap(visible);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollOffsetRef = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const scrollViewportRef = useRef<ScrollViewport>({
    offsetTop: 0,
    height: 0,
  });

  const modalTop = insets.top + theme.spacing.lg;
  const modalBottomGap =
    keyboardOverlap > 0
      ? keyboardOverlap + theme.spacing.sm
      : Math.max(insets.bottom, theme.spacing.sm);
  const modalMaxHeight = Math.max(
    0,
    Math.min(
      Math.round(windowHeight * MODAL_HEIGHT_RATIO),
      windowHeight - modalTop - modalBottomGap,
    ),
  );
  const scrollChrome =
    headerHeight > 0 &&
    modalMaxHeight < headerHeight + footerHeight + theme.controls.fieldHeight;
  const header = (
    <View
      onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}
      style={[styles.header, scrollChrome ? styles.embedded : undefined]}
    >
      <Text accessibilityRole="header" style={styles.title}>
        {title}
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
      <View style={[styles.overlay, { paddingTop: modalTop }]}>
        <Surface
          elevation={2}
          style={[
            styles.content,
            fitContent ? styles.fitContent : undefined,
            { maxHeight: modalMaxHeight },
          ]}
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
            style={[styles.scroll, fitContent ? styles.fitContent : undefined]}
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
