import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { QueryErrorBanner } from '@/shared/components/QueryErrorBanner';
import { theme } from '@/shared/theme/theme';
import { isUnauthorizedError } from '@/shared/api/client';
import { showError } from '@/shared/feedback/showError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export type PaginationFooterProps = {
  hasMore: boolean;
  loading: boolean;
  error?: unknown;
  onLoadMore: () => void | Promise<unknown>;
  onRetry?: () => void | Promise<unknown>;
  label?: string;
  hint?: string;
};

export function PaginationFooter({
  hasMore,
  loading,
  error,
  onLoadMore,
  onRetry,
  label = 'Încarcă mai multe',
  hint,
}: PaginationFooterProps) {
  const inFlight = useRef(false);
  const load = async () => {
    if (loading || inFlight.current) return;
    inFlight.current = true;
    const generation = getSessionGeneration();
    try {
      await (error && onRetry ? onRetry() : onLoadMore());
    } catch (requestError) {
      if (
        generation === getSessionGeneration() &&
        !isUnauthorizedError(requestError)
      )
        showError(
          requestError,
          'Nu am putut încărca următoarele înregistrări.',
        );
    } finally {
      inFlight.current = false;
    }
  };
  if ((!hasMore && !error) || isUnauthorizedError(error)) return null;
  return (
    <View style={styles.footer}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <QueryErrorBanner
        error={error}
        fallbackMessage="Nu am putut încărca următoarele înregistrări."
      />
      <AppButton
        label={error ? 'Reîncearcă încărcarea' : label}
        loading={loading}
        loadingLabel="Se încarcă…"
        variant="soft"
        onPress={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { gap: theme.spacing.sm, paddingTop: theme.spacing.lg },
  hint: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
});
