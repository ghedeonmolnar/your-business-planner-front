import { AppState } from 'react-native';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { getCalendarRevisionApi } from '@/features/bookings/api/bookingsApi';
import { authorizeCalendarRealtimeApi } from '@/features/bookings/api/calendarRealtimeApi';
import { startCalendarSocket } from '@/features/bookings/utils/calendarSocket';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import { reportError } from '@/shared/monitoring/reportError';

const REVISION_REFRESH_INTERVAL_MS = 30_000;
const CHANGE_DEBOUNCE_MS = 200;
type Synchronization = {
  users: number;
  generation: number;
  stop: () => void;
  refresh: () => Promise<void>;
};
const clients = new WeakMap<QueryClient, Map<string, Synchronization>>();

export const acquireCalendarSynchronization = (
  client: QueryClient,
  companyId: string,
) => {
  const companies = clients.get(client) ?? new Map<string, Synchronization>();
  clients.set(client, companies);
  const generation = getSessionGeneration();
  let synchronization = companies.get(companyId);
  if (synchronization && synchronization.generation !== generation) {
    synchronization.stop();
    synchronization = undefined;
  }
  if (!synchronization) {
    synchronization = {
      users: 0,
      generation,
      ...startSynchronization(client, companyId, generation),
    };
    companies.set(companyId, synchronization);
  } else {
    void synchronization.refresh();
  }
  synchronization.users++;
  const acquired = synchronization;
  return () => {
    acquired.users--;
    if (!acquired.users) {
      acquired.stop();
      if (companies.get(companyId) === acquired) companies.delete(companyId);
    }
  };
};

const startSynchronization = (
  client: QueryClient,
  companyId: string,
  generation: number,
) => {
  let disposed = false;
  let running = false;
  let refreshing = false;
  let refreshRequested = false;
  let stopSocket: (() => void) | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  const current = () => !disposed && generation === getSessionGeneration();
  const refresh = async (afterPending = false) => {
    if (!current() || !running) return;
    if (refreshing) {
      if (afterPending) refreshRequested = true;
      return;
    }
    refreshing = true;
    try {
      await client.fetchQuery({
        queryKey: queryKeys.planner.calendarRevision(companyId),
        queryFn: ({ signal }) => getCalendarRevisionApi(signal),
        staleTime: 0,
        gcTime: 30 * 60_000,
      });
    } catch {
      refreshRequested = false;
    } finally {
      refreshing = false;
      if (refreshRequested && current()) {
        refreshRequested = false;
        void refresh();
      }
    }
  };
  const reconcileActivity = () => {
    const shouldRun =
      current() &&
      onlineManager.isOnline() &&
      AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive';
    if (running === shouldRun) return;
    running = shouldRun;
    if (!running) {
      stopSocket?.();
      clearInterval(interval);
      clearTimeout(debounce);
      return;
    }
    void refresh();
    interval = setInterval(() => void refresh(), REVISION_REFRESH_INTERVAL_MS);
    stopSocket = startCalendarSocket({
      companyId,
      authorize: (socketId, channelName, signal) =>
        client.fetchQuery({
          queryKey: queryKeys.planner.calendarAuthorization(
            companyId,
            socketId,
          ),
          queryFn: async () => {
            assertCurrentRequestSession(generation);
            return authorizeCalendarRealtimeApi(socketId, channelName, signal);
          },
          retry: false,
          gcTime: 0,
        }),
      onChanged: () => {
        if (!current()) return;
        clearTimeout(debounce);
        debounce = setTimeout(() => void refresh(true), CHANGE_DEBOUNCE_MS);
      },
      onReady: () => {
        if (current()) void refresh(true);
      },
      onError: error => {
        if (current()) reportError(error, { source: 'calendar-realtime' });
      },
    });
  };
  const appState = AppState.addEventListener('change', reconcileActivity);
  const unsubscribeOnline = onlineManager.subscribe(reconcileActivity);
  const stop = () => {
    disposed = true;
    running = false;
    stopSocket?.();
    clearTimeout(debounce);
    clearInterval(interval);
    appState.remove();
    unsubscribeOnline();
    unsubscribeSession();
  };
  const unsubscribeSession = subscribeSessionChanges(stop);
  reconcileActivity();
  return { stop, refresh };
};
