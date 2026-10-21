import { Dispatch, SetStateAction, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/features/auth/types';
import { setCompanyAccessHandler } from '@/shared/api/sessionExpiry';
import { clearPendingEventNavigation } from '@/shared/navigation/navigationRef';
import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { reportError } from '@/shared/monitoring/reportError';

const MAXIMUM_TIMER_DELAY_MS = 2_147_483_647;

export const useCompanyAccess = (
  user: AuthUser | null,
  setUser: Dispatch<SetStateAction<AuthUser | null>>,
  queryClient: QueryClient,
) => {
  useEffect(() => {
    const endsAt = user?.subscription?.ends_at;
    const accountId = user?.id;
    if (!endsAt || !user?.subscription?.active) {
      return undefined;
    }
    const expiry = Date.parse(endsAt);
    if (!Number.isFinite(expiry)) {
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout>;
    const scheduleExpiry = () => {
      timer = setTimeout(
        () => {
          if (Date.now() < expiry) {
            scheduleExpiry();
            return;
          }
          setUser(current =>
            current &&
            current.id === accountId &&
            current.subscription?.ends_at === endsAt
              ? {
                  ...current,
                  subscription: {
                    active: false,
                    ends_at: current.subscription?.ends_at ?? null,
                    suspended: current.subscription?.suspended ?? false,
                  },
                }
              : current,
          );
        },
        Math.max(0, Math.min(expiry - Date.now(), MAXIMUM_TIMER_DELAY_MS)),
      );
    };
    scheduleExpiry();
    return () => clearTimeout(timer);
  }, [
    user?.id,
    user?.subscription?.ends_at,
    user?.subscription?.active,
    setUser,
  ]);

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
