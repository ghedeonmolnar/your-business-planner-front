import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { clearPendingEventNavigation } from '@/shared/navigation/navigationRef';
import { useQueryClient } from '@tanstack/react-query';
import { getMeApi } from '@/features/auth/api/authApi';
import { useCompanyAccess } from '@/features/auth/hooks/useCompanyAccess';
import { useAccountRefresh } from '@/features/auth/hooks/useAccountRefresh';
import { AuthUser, SignOutOptions } from '@/features/auth/types';
import { endAuthSession } from '@/features/auth/utils/endAuthSession';
import { isUnauthorizedError } from '@/shared/api/client';
import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { setSessionExpiredHandler } from '@/shared/api/sessionExpiry';
import { reportError } from '@/shared/monitoring/reportError';
import { getAuthToken, setAuthToken } from '@/shared/storage/authTokenStorage';

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  user: AuthUser | null;
  bootstrapError: boolean;
  retryBootstrap: () => void;
  signIn: (token: string, user?: AuthUser) => Promise<void>;
  signOut: (options?: SignOutOptions) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapError, setBootstrapError] = useState(false);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const sessionVersion = useRef(0);
  const pendingSignOut = useRef<Promise<void> | null>(null);
  const pendingTokenWrite = useRef<Promise<void> | null>(null);
  const isAuthenticated = user !== null;

  useCompanyAccess(user, setUser, queryClient);

  const signIn = useCallback(
    async (token: string, profile?: AuthUser) => {
      await pendingSignOut.current;
      const version = ++sessionVersion.current;
      const tokenWrite = setAuthToken(token);
      pendingTokenWrite.current = tokenWrite;
      try {
        await tokenWrite;
      } finally {
        if (pendingTokenWrite.current === tokenWrite) {
          pendingTokenWrite.current = null;
        }
      }
      if (version !== sessionVersion.current) {
        return;
      }
      const authenticatedUser = profile ?? (await getMeApi());
      if (version !== sessionVersion.current) {
        return;
      }
      queryClient.clear();
      setUser(authenticatedUser);
      setBootstrapError(false);
      setIsBootstrapping(false);
    },
    [queryClient],
  );

  const signOut = useCallback(
    (options?: SignOutOptions): Promise<void> => {
      if (pendingSignOut.current) {
        return pendingSignOut.current;
      }
      sessionVersion.current += 1;
      setUser(null);
      setBootstrapError(false);
      setIsBootstrapping(false);
      clearPendingEventNavigation();
      queryClient.clear();

      const cleanup = async () => {
        try {
          await pendingTokenWrite.current;
        } catch (error) {
          reportError(error, { source: 'pending-auth-token-write' });
        }
        await endAuthSession(options);
      };

      pendingSignOut.current = cleanup().finally(() => {
        pendingSignOut.current = null;
      });
      return pendingSignOut.current;
    },
    [queryClient],
  );

  useEffect(() => {
    let mounted = true;
    const version = sessionVersion.current;

    const bootstrap = async () => {
      try {
        const token = await getAuthToken();
        const profile = token ? await getMeApi() : null;

        if (!token) {
          clearPendingEventNavigation();
          try {
            await clearEventReminders();
          } catch (error) {
            reportError(error, { source: 'clear-signed-out-reminders' });
          }
        }

        if (mounted && version === sessionVersion.current) {
          setUser(profile);
          setBootstrapError(false);
        }
      } catch (error) {
        if (mounted && version === sessionVersion.current) {
          if (isUnauthorizedError(error)) {
            await signOut({ remote: false });
          } else {
            setBootstrapError(true);
          }
        }
      } finally {
        if (mounted && version === sessionVersion.current) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [bootstrapAttempt, signOut]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      signOut({ remote: false }).catch(error => {
        reportError(error, { source: 'session-expired' });
      });
    });

    return () => setSessionExpiredHandler(null);
  }, [signOut]);

  useAccountRefresh(isAuthenticated, sessionVersion, setUser, signOut);

  const retryBootstrap = useCallback(() => {
    setIsBootstrapping(true);
    setBootstrapAttempt(attempt => attempt + 1);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isBootstrapping,
      user,
      bootstrapError,
      retryBootstrap,
      signIn,
      signOut,
    }),
    [
      isAuthenticated,
      isBootstrapping,
      user,
      bootstrapError,
      retryBootstrap,
      signIn,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
