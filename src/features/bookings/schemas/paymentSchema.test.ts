import { bookingPaymentSchema } from '@/features/bookings/schemas/paymentSchema';
import { companyNow } from '@/shared/utils/formatDate';
import { bookingPaymentApiSchema } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { bookingSchema } from '@/features/bookings/schemas/bookingApiSchemas';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

const payment = {
  type: 'incoming',
  category: 'payment',
  amount: '100.00',
  method: 'cash',
  status: 'completed',
  paid_at: companyNow().format('YYYY-MM-DD'),
  notes: '',
};

test('refuză încasarea viitoare efectuată și permite programarea fără efect asupra soldului', () => {
  const tomorrow = companyNow().add(1, 'day').format('YYYY-MM-DD');
  expect(bookingPaymentSchema.safeParse(payment).success).toBe(true);
  expect(
    bookingPaymentSchema.safeParse({ ...payment, paid_at: tomorrow }).success,
  ).toBe(false);
  expect(
    bookingPaymentSchema.safeParse({
      ...payment,
      paid_at: tomorrow,
      status: 'pending',
    }).success,
  ).toBe(true);
});

test('acceptă avans și plată și păstrează compatibilitatea operațiilor vechi', () => {
  for (const category of ['advance', 'payment', 'partial', 'full', 'other'])
    expect(
      bookingPaymentSchema.safeParse({ ...payment, category }).success,
    ).toBe(true);
  expect(
    bookingPaymentSchema.safeParse({ ...payment, category: 'staff' }).success,
  ).toBe(false);
});

test('respinge sumele API malformate și preferă suma zecimală exactă în registru', () => {
  expect(bookingSchema.safeParse(plannerBooking).success).toBe(true);
  expect(
    bookingSchema.safeParse({ ...plannerBooking, paid_amount: 'necunoscut' })
      .success,
  ).toBe(false);
  expect(
    bookingSchema.safeParse({ ...plannerBooking, menu_price: [] }).success,
  ).toBe(false);
  const response = bookingPaymentApiSchema.parse({
    ...payment,
    id: 'payment-1',
    event_id: 'event-1',
    version: 1,
    amount: 1,
    amount_decimal: '1.01',
  });
  expect(response.amount).toBe('1.01');
});
