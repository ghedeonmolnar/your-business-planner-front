import { useSyncExternalStore } from 'react';
import { subscribeSessionChanges } from '@/shared/api/sessionExpiry';

let required = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const requireClientUpdate = () => {
  required = true;
  listeners.forEach(listener => listener());
};
export const clearClientUpdateRequirement = () => {
  required = false;
  listeners.forEach(listener => listener());
};
export const useClientUpdateRequired = () =>
  useSyncExternalStore(subscribe, () => required);
subscribeSessionChanges(clearClientUpdateRequirement);
