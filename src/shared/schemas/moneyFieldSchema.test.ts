import {
  MAX_RATE_AMOUNT,
  moneyFieldSchema,
  nullableMoneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';

const options = {
  formatMessage: 'format',
  maximum: MAX_RATE_AMOUNT,
  maximumMessage: 'maximum',
  minimum: 0,
  minimumMessage: 'minimum',
};

test('money fields accept at most two decimal places', () => {
  const schema = moneyFieldSchema(options);

  expect(schema.safeParse('12.34').success).toBe(true);
  expect(schema.safeParse('1e3').success).toBe(false);
  expect(schema.safeParse(12.345).success).toBe(false);
  expect(schema.safeParse(MAX_RATE_AMOUNT + 1).success).toBe(false);
});

test('nullable money fields preserve an empty tariff as null', () => {
  const schema = nullableMoneyFieldSchema(options);

  expect(schema.parse('')).toBeNull();
  expect(schema.parse(null)).toBeNull();
  expect(schema.safeParse('12.345').success).toBe(false);
});
