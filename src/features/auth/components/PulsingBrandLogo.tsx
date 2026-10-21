import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { BrandLogo } from '@/shared/components/BrandLogo';
import { theme } from '@/shared/theme/theme';

const PULSE_PHASE_DURATION_MS = 1800;
const BRAND_LOGO_SIZE = 112;

export function PulsingBrandLogo() {
  const logoPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulsePhase = (toValue: number) =>
      Animated.timing(logoPulse, {
        duration: PULSE_PHASE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        toValue,
        useNativeDriver: true,
      });
    const pulseAnimation = Animated.loop(
      Animated.sequence([pulsePhase(1), pulsePhase(0)]),
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [logoPulse]);

  return (
    <View style={styles.brandBlock}>
      <View style={styles.logoStage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.logoPulse,
            {
              opacity: logoPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.14, 0.28],
              }),
              transform: [
                {
                  scale: logoPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.07],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.logoMark}>
          <BrandLogo size={BRAND_LOGO_SIZE} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoStage: {
    alignItems: 'center',
    height: 136,
    justifyContent: 'center',
    width: 136,
  },
  logoPulse: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 132,
    position: 'absolute',
    width: 132,
  },
  logoMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 128,
    height: 128,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadow,
  },
});
