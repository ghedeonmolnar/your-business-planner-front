import React from 'react';
import { StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { theme } from '@/shared/theme/theme';
import { useButtonAction, ButtonAction } from '@/shared/hooks/useButtonAction';

type ErrorBannerProps = {
  message: string;
  onRetry?: ButtonAction;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const action = useButtonAction(() => onRetry?.());
  return (
    <Banner
      accessibilityRole="alert"
      actions={
        onRetry
          ? [
              {
                label: 'Reîncearcă',
                onPress: action.press,
                loading: action.pending,
                disabled: action.pending,
              },
            ]
          : []
      }
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
