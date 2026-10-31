import { useRef } from 'react';
import { ViewProps } from 'react-native';

const MINIMUM_MONTH_SWIPE_DISTANCE = 48;

export function useCalendarMonthSwipe(
  onChange: (direction: -1 | 1) => void,
): Pick<
  ViewProps,
  'onTouchStart' | 'onTouchMove' | 'onTouchEnd' | 'onTouchCancel'
> {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: ({ nativeEvent }) => {
      start.current =
        nativeEvent.touches.length === 1
          ? { x: nativeEvent.pageX, y: nativeEvent.pageY }
          : null;
    },
    onTouchMove: ({ nativeEvent }) => {
      if (nativeEvent.touches.length !== 1) start.current = null;
    },
    onTouchCancel: () => {
      start.current = null;
    },
    onTouchEnd: ({ nativeEvent }) => {
      const first = start.current;
      start.current = null;
      if (!first || nativeEvent.touches.length !== 0) return;
      const horizontalDistance = nativeEvent.pageX - first.x;
      const verticalDistance = nativeEvent.pageY - first.y;
      if (
        Math.abs(horizontalDistance) >= MINIMUM_MONTH_SWIPE_DISTANCE &&
        Math.abs(horizontalDistance) > Math.abs(verticalDistance)
      )
        onChange(horizontalDistance < 0 ? 1 : -1);
    },
  };
}
