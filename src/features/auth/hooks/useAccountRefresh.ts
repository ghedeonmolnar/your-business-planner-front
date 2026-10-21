import { RefObject, useEffect } from 'react';
import { AppState } from 'react-native';
import { getMeApi } from '@/features/auth/api/authApi';
import { AuthUser, SignOutOptions } from '@/features/auth/types';
import { isUnauthorizedError } from '@/shared/api/client';
import { reportError } from '@/shared/monitoring/reportError';

const ACCOUNT_REFRESH_INTERVAL_MS = 60_000;

export function useAccountRefresh(
  isAuthenticated: boolean,
  sessionVersion: RefObject<number>,
  setUser: (user: AuthUser) => void,
  signOut: (options?: SignOutOptions) => Promise<void>,
) {
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let active = true;
    let refreshing = false;
    const refreshAccount = async () => {
      if (refreshing || AppState.currentState === 'background') {
        return;
      }
      refreshing = true;
      const version = sessionVersion.current;
      try {
        const profile = await getMeApi();
        if (active && version === sessionVersion.current) {
          setUser(profile);
        }
      } catch (error) {
        if (!active || version !== sessionVersion.current) {
          return;
        }
        if (isUnauthorizedError(error)) {
          await signOut({ remote: false });
        } else {
          reportError(error, { source: 'account-refresh' });
        }
      } finally {
        refreshing = false;
      }
    };

    const interval = setInterval(() => {
      void refreshAccount();
    }, ACCOUNT_REFRESH_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshAccount();
      }
    });

    return () => {
      active = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [isAuthenticated, sessionVersion, setUser, signOut]);
}
