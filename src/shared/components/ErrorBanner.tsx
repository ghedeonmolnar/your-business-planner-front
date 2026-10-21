import React from 'react';
import { StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Banner
      accessibilityRole="alert"
      actions={onRetry ? [{ label: 'Reîncearcă', onPress: onRetry }] : []}
      icon={({ size }) => (
        <Ionicons
          color={theme.colors.error}
          name="alert-circle-outline"
          size={size}
        />
      )}
      style={styles.container}
      theme={{ colors: { onSurface: theme.colors.onErrorContainer } }}
      visible
    >
      {message}
    </Banner>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
});
