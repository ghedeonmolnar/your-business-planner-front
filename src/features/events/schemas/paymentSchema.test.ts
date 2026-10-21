import { emptyPaymentForm, paymentSchema } from '@/features/events/schemas/paymentSchema';

test('payment amount rejects scientific notation and excess numeric precision', () => {
  expect(
    paymentSchema.safeParse({ ...emptyPaymentForm, amount: '1e3' }).success,
  ).toBe(false);
  expect(
    paymentSchema.safeParse({ ...emptyPaymentForm, amount: 12.3456 }).success,
  ).toBe(false);
});
