import { Easing } from 'react-native-reanimated';
import { gatifyLogoData } from '@/shared/branding/gatifyLogoData';

type Track = {
  readonly times: readonly number[];
  readonly values: readonly number[];
};
export type LogoShape = {
  readonly name: string;
  readonly path: string;
  readonly opacity: Track;
  readonly translateX: Track;
  readonly translateY: Track;
  readonly scaleX: Track;
  readonly pivotX: number;
};
export type LogoFrame = {
  opacity: number;
  matrix: [number, number, number, number, number, number];
};
const easing = Easing.bezierFn(...gatifyLogoData.easing);

const trackValue = (track: Track, progress: number) => {
  'worklet';
  if (progress <= track.times[0]) return track.values[0];
  for (let index = 1; index < track.times.length; index++) {
    if (progress <= track.times[index]) {
      const fraction =
        (progress - track.times[index - 1]) /
        (track.times[index] - track.times[index - 1]);
      return (
        track.values[index - 1] +
        (track.values[index] - track.values[index - 1]) * easing(fraction)
      );
    }
  }
  return track.values[track.values.length - 1];
};

export const gatifyLogoFrame = (
  shape: LogoShape,
  progress: number,
): LogoFrame => {
  'worklet';
  const scale = trackValue(shape.scaleX, progress);
  const x = trackValue(shape.translateX, progress) + shape.pivotX * (1 - scale);
  return {
    opacity: trackValue(shape.opacity, progress),
    matrix: [scale, 0, 0, 1, x, trackValue(shape.translateY, progress)],
  };
};
