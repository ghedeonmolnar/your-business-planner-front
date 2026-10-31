const CURRENCY_LABEL = 'lei';
const LOCALE = 'ro-RO';
const LEI_PREPOSITION_THRESHOLD = 20;
const LEI_PREPOSITION_GROUP_SIZE = 100;

export const toAmount = (value: unknown) => {
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    (typeof value === 'string' && !/^-?\d+(?:\.\d{1,2})?$/.test(value))
  )
    return Number.NaN;
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : Number.NaN;
};

export const toCents = (value: unknown) => Math.round(toAmount(value) * 100);

export const sumMoney = (values: readonly unknown[]) =>
  values.reduce<number>((total, value) => total + toCents(value), 0) / 100;

export const formatMoney = (value: unknown) =>
  Number.isFinite(toAmount(value))
    ? `${Math.round(toAmount(value))} ${CURRENCY_LABEL}`
    : 'Indisponibil';

export const formatExactAmount = (value: unknown) =>
  Number.isFinite(toAmount(value))
    ? toAmount(value).toLocaleString(LOCALE, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      })
    : 'Indisponibil';

export const formatExactMoney = (value: unknown) =>
  Number.isFinite(toAmount(value))
    ? `${formatExactAmount(value)} ${CURRENCY_LABEL}`
    : 'Indisponibil';

export const formatMoneyInWords = (value: unknown) => {
  if (!Number.isFinite(toAmount(value))) return 'Indisponibil';
  const amount = Math.abs(toAmount(value));
  const remainder = amount % LEI_PREPOSITION_GROUP_SIZE;
  const needsPreposition =
    Number.isInteger(amount) &&
    (remainder >= LEI_PREPOSITION_THRESHOLD || (amount > 0 && remainder === 0));
  const currency = amount === 1 ? 'leu' : CURRENCY_LABEL;

  return `${formatExactAmount(value)}${needsPreposition ? ' de ' : ' '}${currency}`;
};
