import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { gatifyLogoData } from '@/shared/branding/gatifyLogoData';
import { gatifyLogoFrame, LogoShape } from '@/shared/branding/gatifyLogoFrame';
import { useBrandLogoProgress } from '@/shared/branding/useBrandLogoProgress';

const AnimatedGroup = Animated.createAnimatedComponent(G);
const DEFAULT_LOGO_WIDTH = 140;

function LogoPart({
  shape,
  progress,
  clip,
  gradient,
}: {
  shape: LogoShape;
  progress: SharedValue<number>;
  clip: string;
  gradient: string;
}) {
  const props = useAnimatedProps(() => gatifyLogoFrame(shape, progress.value));
  const shine = shape.name === 'shine';
  return (
    <G clipPath={shine ? `url(#${clip})` : undefined}>
      <AnimatedGroup animatedProps={props}>
        <Path
          d={shape.path}
          fill={shine ? `url(#${gradient})` : gatifyLogoData.ink}
        />
      </AnimatedGroup>
    </G>
  );
}

export function BrandLogo({ width = DEFAULT_LOGO_WIDTH }: { width?: number }) {
  const progress = useBrandLogoProgress();
  const identifier = useId().replace(/:/g, '');
  const clip = `gatify-clip-${identifier}`;
  const gradient = `gatify-shine-${identifier}`;
  return (
    <View
      accessibilityLabel="Gatify Software"
      accessibilityRole="image"
      accessible
      pointerEvents="none"
      style={[styles.logo, { width }]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={gatifyLogoData.viewBox}
        accessible={false}
      >
        <Defs>
          <ClipPath id={clip}>
            {gatifyLogoData.shapes
              .filter(shape => shape.name !== 'shine')
              .map(shape => (
                <Path key={shape.name} d={shape.path} />
              ))}
          </ClipPath>
          <LinearGradient id={gradient} x1="0" x2="1">
            {gatifyLogoData.stops.map(stop => (
              <Stop
                key={stop.offset}
                offset={Number(stop.offset)}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        {gatifyLogoData.shapes.map(shape => (
          <LogoPart
            key={shape.name}
            shape={shape}
            progress={progress}
            clip={clip}
            gradient={gradient}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    aspectRatio: gatifyLogoData.width / gatifyLogoData.height,
    flexShrink: 1,
    maxWidth: '100%',
  },
});
