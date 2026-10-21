import React from 'react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/AuthProvider';
import RootNavigator from '@/app/navigation/RootNavigator';
import { isUnauthorizedError } from '@/shared/api/client';
import { configureQueryFocus } from '@/shared/api/configureQueryFocus';
import { configureQueryOnline } from '@/shared/api/configureQueryOnline';
import { notifySessionExpired } from '@/shared/api/sessionExpiry';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { reportError } from '@/shared/monitoring/reportError';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { configureCalendarLocale } from '@/shared/utils/configureCalendarLocale';

configureCalendarLocale();
configureQueryFocus();
configureQueryOnline();

const handleServerStateError = (error: unknown) => {
  if (isUnauthorizedError(error)) {
    notifySessionExpired();
    return;
  }

  reportError(error, { source: 'server-state' });
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        !isUnauthorizedError(error) && failureCount < 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({ onError: handleServerStateError }),
  mutationCache: new MutationCache({ onError: handleServerStateError }),
});

export default function AppRoot() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigator />
              <DialogHost />
            </AuthProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
