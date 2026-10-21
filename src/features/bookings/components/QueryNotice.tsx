import React from 'react';
import { Text } from 'react-native-paper';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';

export function QueryNotice({
  loading,
  error,
  empty,
  retry,
}: {
  loading: boolean;
  error: unknown;
  empty?: boolean;
  retry: () => void;
}) {
  if (loading) {
    return <LoadingState />;
  }
  if (error) {
    return (
      <ErrorBanner
        message={getErrorMessage(error, 'Nu am putut încărca datele.')}
        onRetry={retry}
      />
    );
  }
  return empty ? (
    <Text style={styles.muted}>Nu există înregistrări.</Text>
  ) : null;
}
