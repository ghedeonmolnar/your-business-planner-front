import { useSyncExternalStore } from 'react';
import { subscribeSessionChanges } from '@/shared/api/sessionExpiry';

type ReminderStatus = { deferred: number; failed: number; updatedAt: number };
let status: ReminderStatus | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const publishReminderStatus = (next: ReminderStatus | null) => {
  status = next;
  listeners.forEach(listener => listener());
};
export const useReminderStatus = () =>
  useSyncExternalStore(subscribe, () => status);
subscribeSessionChanges(() => publishReminderStatus(null));
