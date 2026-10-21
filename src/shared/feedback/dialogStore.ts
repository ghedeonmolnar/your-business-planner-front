import { useEffect, useState, useSyncExternalStore } from 'react';

export type DialogRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void;
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
  dialogQueue = [...dialogQueue, { ...request, id: nextDialogId++ }];
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
