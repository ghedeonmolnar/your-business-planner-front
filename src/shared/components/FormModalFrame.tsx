import React, { useRef } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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

const MODAL_HEIGHT_RATIO = 0.9;
const MIN_MODAL_HEIGHT = 240;

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
  closeLabel = 'Închide formularul',
}: FormModalFrameProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardOverlap = useKeyboardOverlap(visible);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollOffsetRef = useRef(0);
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
    MIN_MODAL_HEIGHT,
    Math.min(
      Math.round(windowHeight * MODAL_HEIGHT_RATIO),
      windowHeight - modalTop - modalBottomGap,
    ),
  );

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
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <IconButton
              accessibilityLabel={closeLabel}
              icon="close"
              onPress={requestClose}
            />
          </View>

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
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Surface>
      </View>
      {visible ? <DialogHost /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.title,
    fontWeight: '800',
    paddingRight: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  fitContent: { flex: 0, flexBasis: 'auto', flexGrow: 0, flexShrink: 1 },
  scrollContent: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
});
