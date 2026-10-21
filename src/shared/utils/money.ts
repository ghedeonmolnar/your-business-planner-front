const CURRENCY_LABEL = 'lei';
const LOCALE = 'ro-RO';
const LEI_PREPOSITION_THRESHOLD = 20;
const LEI_PREPOSITION_GROUP_SIZE = 100;

export const toAmount = (value: unknown) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
};

export const toCents = (value: unknown) => Math.round(toAmount(value) * 100);

export const sumMoney = (values: readonly unknown[]) =>
  values.reduce<number>((total, value) => total + toCents(value), 0) / 100;

export const formatMoney = (value: unknown) =>
  `${Math.round(toAmount(value))} ${CURRENCY_LABEL}`;

const formatAmount = (value: unknown) =>
  toAmount(value).toLocaleString(LOCALE, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

export const formatExactMoney = (value: unknown) =>
  `${formatAmount(value)} ${CURRENCY_LABEL}`;

export const formatMoneyInWords = (value: unknown) => {
  const amount = Math.abs(toAmount(value));
  const remainder = amount % LEI_PREPOSITION_GROUP_SIZE;
  const needsPreposition =
    Number.isInteger(amount) &&
    (remainder >= LEI_PREPOSITION_THRESHOLD || (amount > 0 && remainder === 0));
  const currency = amount === 1 ? 'leu' : CURRENCY_LABEL;

  return `${formatAmount(value)}${needsPreposition ? ' de ' : ' '}${currency}`;
};
