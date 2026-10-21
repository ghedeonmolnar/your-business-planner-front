import { calendarSummarySchema } from '@/features/bookings/schemas/bookingApiSchemas';

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
