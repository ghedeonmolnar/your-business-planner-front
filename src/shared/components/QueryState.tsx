import React from 'react';
import { LoadingState } from '@/shared/components/LoadingState';
import { EmptyState } from '@/shared/components/EmptyState';
import { QueryErrorBanner } from '@/shared/components/QueryErrorBanner';

type QueryStateProps = {
  loading: boolean;
  error?: unknown;
  empty?: boolean;
  hasData?: boolean;
  retry?: () => void;
  fallbackMessage?: string;
  emptyState?: React.ComponentProps<typeof EmptyState>;
};

export function QueryState({
  loading,
  error,
  empty = false,
  hasData = false,
  retry,
  fallbackMessage = 'Nu am putut încărca datele.',
  emptyState,
}: QueryStateProps) {
  if (loading && !hasData) return <LoadingState />;
  if (error)
    return (
      <QueryErrorBanner
        error={error}
        fallbackMessage={fallbackMessage}
        onRetry={retry}
      />
    );
  return empty && !hasData ? (
    <EmptyState
      icon="file-tray-outline"
      title="Nu există înregistrări"
      message="Înregistrările vor apărea aici după adăugare."
      {...emptyState}
    />
  ) : null;
}
