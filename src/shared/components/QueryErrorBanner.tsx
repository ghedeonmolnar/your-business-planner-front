import React from 'react';
import { isUnauthorizedError } from '@/shared/api/client';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type QueryErrorBannerProps = {
  error: unknown;
  fallbackMessage: string;
  onRetry?: () => void;
};

export function QueryErrorBanner({
  error,
  fallbackMessage,
  onRetry,
}: QueryErrorBannerProps) {
  if (!error || isUnauthorizedError(error)) {
    return null;
  }

  return (
    <ErrorBanner
      message={getErrorMessage(error, fallbackMessage)}
      onRetry={onRetry}
    />
  );
}
