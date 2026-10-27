import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { gatifyLogoData } from '@/shared/branding/gatifyLogoData';

const FULL_WORD_FRAME = 0.5;
const INDEFINITE_REPEATS = -1;

export function useBrandLogoProgress() {
  const initialReducedMotion = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const progress = useSharedValue(initialReducedMotion ? FULL_WORD_FRAME : 0);
  useEffect(() => {
    const motion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    const state = AppState.addEventListener('change', value =>
      setActive(value === 'active'),
    );
    return () => {
      motion.remove();
      state.remove();
    };
  }, []);
  useEffect(() => {
    cancelAnimation(progress);
    if (reducedMotion || !active) {
      progress.value = FULL_WORD_FRAME;
    } else {
      progress.value = 0;
      progress.value = withRepeat(
        withTiming(1, {
          duration: gatifyLogoData.durationMs,
          easing: Easing.linear,
        }),
        INDEFINITE_REPEATS,
      );
    }
    return () => cancelAnimation(progress);
  }, [active, reducedMotion, progress]);
  return progress;
}
