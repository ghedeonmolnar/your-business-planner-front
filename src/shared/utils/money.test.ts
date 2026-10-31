import {
  formatExactMoney,
  formatMoney,
  formatMoneyInWords,
  sumMoney,
  toAmount,
} from '@/shared/utils/money';

test('rounds compact amounts and keeps decimals for exact amounts', () => {
  expect(formatMoney(1234.56)).toBe('1235 lei');
  expect(formatExactMoney(1234.5)).toBe('1.234,5 lei');
  expect(formatExactMoney(1200)).toBe('1.200 lei');
});

test('reads amounts that arrive as decimal strings', () => {
  expect(toAmount('250.50')).toBe(250.5);
  expect(formatMoney('250.50')).toBe('251 lei');
});

test('distinguishes unavailable or malformed amounts from a real zero', () => {
  for (const value of [null, undefined, 'n/a', '', [], {}, true])
    expect(toAmount(value)).toBeNaN();
  expect(formatMoney(undefined)).toBe('Indisponibil');
  expect(formatExactMoney('n/a')).toBe('Indisponibil');
  expect(formatExactMoney('0.00')).toBe('0 lei');
});

test('adds money through integer cents', () => {
  expect(sumMoney([33.33, 33.33, 33.34])).toBe(100);
  expect(sumMoney([0.1, 0.2])).toBe(0.3);
});

test.each([
  [500, '500 de lei'],
  [1200, '1.200 de lei'],
  [475.5, '475,5 lei'],
  [20, '20 de lei'],
  [19, '19 lei'],
  [101, '101 lei'],
  [1, '1 leu'],
  [0, '0 lei'],
])('scrie suma %s în mesajul clientului', (amount, expected) => {
  expect(formatMoneyInWords(amount)).toBe(expected);
});
