import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import type { ButtonAction } from '@/shared/hooks/useButtonAction';

export type DialogRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: ButtonAction;
  sessionGeneration?: number;
};

export type ActiveDialog = DialogRequest & { id: number };

let dialogQueue: ActiveDialog[] = [];
let mountedHostIds: number[] = [];
let nextDialogId = 1;
let nextHostId = 1;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const showDialog = (request: DialogRequest) => {
  const generation = request.sessionGeneration ?? getSessionGeneration();
  if (generation !== getSessionGeneration()) return;
  dialogQueue = [
    ...dialogQueue,
    {
      ...request,
      id: nextDialogId++,
      sessionGeneration: generation,
      onConfirm: () => {
        if (generation === getSessionGeneration()) return request.onConfirm?.();
      },
    },
  ];
  notifyListeners();
};

export const closeDialog = (dialogId: number) => {
  dialogQueue = dialogQueue.filter(dialog => dialog.id !== dialogId);
  notifyListeners();
};

export const clearDialogs = () => {
  dialogQueue = [];
  notifyListeners();
};

subscribeSessionChanges(clearDialogs);

export const useActiveDialog = (): ActiveDialog | null => {
  const [hostId] = useState(() => nextHostId++);

  useEffect(() => {
    mountedHostIds = [...mountedHostIds, hostId];
    notifyListeners();

    return () => {
      mountedHostIds = mountedHostIds.filter(id => id !== hostId);
      notifyListeners();
    };
  }, [hostId]);

  return useSyncExternalStore(subscribe, () =>
    mountedHostIds[mountedHostIds.length - 1] === hostId
      ? (dialogQueue[0] ?? null)
      : null,
  );
};
