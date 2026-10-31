import {
  bookingPageSchema,
  bookingSchema,
  calendarSummarySchema,
} from '@/features/bookings/schemas/bookingApiSchemas';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('calendarul refuză zilele și numărătorile externe invalide', () => {
  const day = { date: '2028-02-29', confirmed: 1, tentative: 0, free: 2 };
  expect(
    calendarSummarySchema.safeParse({ halls: [], days: [day] }).success,
  ).toBe(true);
  for (const invalid of [
    { ...day, date: '2027-02-29' },
    { ...day, confirmed: -1 },
    { ...day, tentative: 0.5 },
    { ...day, free: '2' },
  ]) {
    expect(
      calendarSummarySchema.safeParse({ halls: [], days: [invalid] }).success,
    ).toBe(false);
  }
});

test('acceptă totaluri cumulate peste limita unei plăți și refuză sumele care pierd precizia în bani', () => {
  expect(
    bookingSchema.safeParse({
      ...plannerBooking,
      paid_amount: '100000099.99',
      outgoing_amount: '100000000.00',
      cash_profit_amount: '99.99',
    }).success,
  ).toBe(true);
  for (const paidAmount of ['90071992547410.00', '100.001', '1e8', ''])
    expect(
      bookingSchema.safeParse({ ...plannerBooking, paid_amount: paidAmount })
        .success,
    ).toBe(false);
});

test('rejects malformed monthly counts before they reach the bookings screen', () => {
  const response = {
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0, months: [] },
  };
  expect(bookingPageSchema.safeParse(response).success).toBe(true);
  for (const month of [
    { month: '2027-13', total: 1 },
    { month: '2027-11', total: -1 },
    { month: '2027-11', total: '2' },
  ]) {
    expect(
      bookingPageSchema.safeParse({
        ...response,
        meta: { ...response.meta, months: [month] },
      }).success,
    ).toBe(false);
  }
});
