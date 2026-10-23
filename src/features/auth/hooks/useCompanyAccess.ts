import { Dispatch, SetStateAction, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/features/auth/types';
import { setCompanyAccessHandler } from '@/shared/api/sessionExpiry';
import { clearPendingEventNavigation } from '@/shared/navigation/navigationRef';
import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { reportError } from '@/shared/monitoring/reportError';

export const useCompanyAccess = (
  user: AuthUser | null,
  setUser: Dispatch<SetStateAction<AuthUser | null>>,
  queryClient: QueryClient,
) => {
  useEffect(() => {
    setCompanyAccessHandler(() => {
      setUser(current =>
        current
          ? {
              ...current,
              subscription: {
                active: false,
                ends_at: current.subscription?.ends_at ?? null,
                suspended: current.subscription?.suspended ?? false,
              },
            }
          : null,
      );
    });
    return () => setCompanyAccessHandler(null);
  }, [setUser]);

  useEffect(() => {
    if (user?.subscription?.active !== false) {
      return;
    }
    clearPendingEventNavigation();
    queryClient
      .cancelQueries()
      .then(() => queryClient.clear())
      .catch(error => reportError(error, { source: 'cancel-company-queries' }));
    clearEventReminders().catch(error =>
      reportError(error, { source: 'clear-inactive-company-reminders' }),
    );
  }, [user?.subscription?.active, queryClient]);
};
