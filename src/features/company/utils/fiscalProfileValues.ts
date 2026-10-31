export const normalizeFiscalCode = (value: string) =>
  value.trim().replace(/^RO/i, '').replace(/\s/g, '');

export const normalizeIban = (value: string) =>
  value.replace(/\s/g, '').toUpperCase();

export const isValidFiscalCode = (value: string) =>
  /^[1-9][0-9]{1,9}$/.test(value);
