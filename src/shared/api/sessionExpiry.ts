type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let companyAccessHandler: SessionExpiredHandler | null = null;
let sessionGeneration = 0;
const sessionChangeListeners = new Set<SessionExpiredHandler>();

export const getSessionGeneration = () => sessionGeneration;

export const advanceSessionGeneration = () => {
  sessionGeneration += 1;
  sessionChangeListeners.forEach(listener => listener());
};

export const subscribeSessionChanges = (listener: SessionExpiredHandler) => {
  sessionChangeListeners.add(listener);
  return () => {
    sessionChangeListeners.delete(listener);
  };
};

export const setCompanyAccessHandler = (
  handler: SessionExpiredHandler | null,
) => {
  companyAccessHandler = handler;
};

export const notifyCompanyAccessInactive = () => {
  companyAccessHandler?.();
};

export const setSessionExpiredHandler = (
  handler: SessionExpiredHandler | null,
) => {
  sessionExpiredHandler = handler;
};

export const notifySessionExpired = () => {
  sessionExpiredHandler?.();
};
