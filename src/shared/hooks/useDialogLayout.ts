import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { theme } from '@/shared/theme/theme';

const DIALOG_HEIGHT_RATIO = 0.9;
const SECONDARY_DIALOG_MAX_HEIGHTS = {
  confirmation: 420,
  selection: 440,
  calendar: 520,
  time: 480,
} as const;

export type DialogLayoutSize =
  'form' | keyof typeof SECONDARY_DIALOG_MAX_HEIGHTS;

export const useDialogLayout = (
  visible: boolean,
  size: DialogLayoutSize = 'form',
) => {
  const { height: windowHeight, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardOverlap = useKeyboardOverlap(visible);
  const modalTop = insets.top + theme.spacing.lg;
  const bottomGap =
    keyboardOverlap > 0
      ? keyboardOverlap + theme.spacing.sm
      : Math.max(insets.bottom, theme.spacing.sm);
  const modalMaxHeight = Math.max(
    0,
    Math.min(
      Math.round(windowHeight * DIALOG_HEIGHT_RATIO),
      windowHeight - modalTop - bottomGap,
      size === 'form'
        ? windowHeight
        : SECONDARY_DIALOG_MAX_HEIGHTS[size] * Math.max(1, fontScale),
    ),
  );
  return {
    modalTop,
    modalMaxHeight,
    overlayInsets: { paddingTop: modalTop, paddingBottom: bottomGap },
  };
};
