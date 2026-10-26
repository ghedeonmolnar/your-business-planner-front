import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { AuthUser } from '@/features/auth/types';
import { getMeApi } from '@/features/auth/api/authApi';
import { reportError } from '@/shared/monitoring/reportError';

const MAXIMUM_TIMER_DELAY_MS = 2_147_483_647;
const ACCESS_RETRY_DELAY_MS = 5_000;
const CONFIRMED_ACCESS_RECHECK_DELAY_MS = 30_000;

export const useSubscriptionBoundary = (
  user: AuthUser | null,
  setUser: Dispatch<SetStateAction<AuthUser | null>>,
  sessionVersion: RefObject<number>,
) => {
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    const endsAt = user?.subscription?.ends_at;
    const accountId = user?.id;
    const expiry = endsAt ? Date.parse(endsAt) : NaN;
    setChecking(false);
    if (!user?.subscription?.active || !Number.isFinite(expiry)) {
      return undefined;
    }
    let active = true;
    let refreshing = false;
    let boundaryReached = false;
    let confirmed = false;
    let timer: ReturnType<typeof setTimeout>;
    const version = sessionVersion.current;
    const revalidate = async () => {
      if (!active || refreshing || version !== sessionVersion.current) {
        return;
      }
      if (!boundaryReached && Date.now() < expiry) {
        timer = setTimeout(
          () => {
            void revalidate();
          },
          Math.min(expiry - Date.now(), MAXIMUM_TIMER_DELAY_MS),
        );
        return;
      }
      refreshing = true;
      boundaryReached = true;
      if (!confirmed) setChecking(true);
      try {
        const profile = await getMeApi();
        if (active && version === sessionVersion.current) {
          confirmed = Boolean(profile.subscription?.active);
          setChecking(false);
          setUser(current =>
            current &&
            current.id === accountId &&
            current.subscription?.ends_at === endsAt
              ? profile
              : current,
          );
        }
      } catch (error) {
        if (active && version === sessionVersion.current) {
          reportError(error, { source: 'subscription-boundary' });
        }
      } finally {
        refreshing = false;
        if (active && version === sessionVersion.current) {
          timer = setTimeout(
            () => {
              void revalidate();
            },
            confirmed
              ? CONFIRMED_ACCESS_RECHECK_DELAY_MS
              : ACCESS_RETRY_DELAY_MS,
          );
        }
      }
    };
    timer = setTimeout(
      () => {
        void revalidate();
      },
      Math.max(0, Math.min(expiry - Date.now(), MAXIMUM_TIMER_DELAY_MS)),
    );
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && (boundaryReached || Date.now() >= expiry)) {
        clearTimeout(timer);
        void revalidate();
      }
    });
    return () => {
      active = false;
      clearTimeout(timer);
      subscription.remove();
    };
  }, [
    user?.id,
    user?.subscription?.active,
    user?.subscription?.ends_at,
    setUser,
    sessionVersion,
  ]);
  return checking;
};
