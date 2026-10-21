type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let companyAccessHandler: SessionExpiredHandler | null = null;

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
