type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let companyAccessHandler: SessionExpiredHandler | null = null;
let sessionGeneration = 0;

export const getSessionGeneration = () => sessionGeneration;

export const advanceSessionGeneration = () => {
  sessionGeneration += 1;
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
