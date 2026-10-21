import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { theme } from '@/shared/theme/theme';

const SEGMENTS = 6;
const BAR_HEIGHT = theme.spacing.sm;

export function OccupancyBar({ value }: { value: number }) {
  const gradientId = useId().replace(/:/g, '');
  const percentage = Math.max(0, Math.min(100, value * 100));
  return (
    <View
      accessible
      accessibilityLabel="Grad de ocupare"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
    >
      <Svg
        width="100%"
        height={BAR_HEIGHT}
        viewBox={`0 0 100 ${BAR_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={theme.colors.menu.primarySoft} />
            <Stop offset="100%" stopColor={theme.colors.menu.primary} />
          </LinearGradient>
        </Defs>
        <Rect
          width={100}
          height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          fill={theme.colors.menu.border}
        />
        <Rect
          width={percentage}
          height={BAR_HEIGHT}
          rx={BAR_HEIGHT / 2}
          fill={`url(#${gradientId})`}
        />
        {Array.from({ length: SEGMENTS - 1 }, (_, index) => (
          <Rect
            key={index}
            x={((index + 1) * 100) / SEGMENTS}
            y={0}
            width={1}
            height={BAR_HEIGHT}
            fill={theme.colors.menu.surface}
          />
        ))}
      </Svg>
    </View>
  );
}
