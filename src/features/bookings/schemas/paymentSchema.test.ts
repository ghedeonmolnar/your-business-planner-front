import { bookingPaymentSchema } from '@/features/bookings/schemas/paymentSchema';

const payment = {
  type: 'incoming' as const,
  category: 'advance',
  amount: '10000,50',
  paid_at: '2027-11-13',
  method: 'transfer' as const,
  status: 'completed' as const,
  notes: '',
};

test('validates decimal input and keeps receipt categories separate from expenses', () => {
  expect(bookingPaymentSchema.safeParse(payment).success).toBe(true);
  expect(
    bookingPaymentSchema.safeParse({ ...payment, type: 'outgoing' }).success,
  ).toBe(false);
  expect(
    bookingPaymentSchema.safeParse({
      ...payment,
      type: 'outgoing',
      category: 'staff',
    }).success,
  ).toBe(true);
  expect(
    bookingPaymentSchema.safeParse({ ...payment, category: 'refund' }).success,
  ).toBe(false);
  expect(
    bookingPaymentSchema.safeParse({ ...payment, amount: '0' }).success,
  ).toBe(false);
});
