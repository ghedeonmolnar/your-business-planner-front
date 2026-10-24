import {
  bookingFilterSchema,
  EMPTY_BOOKING_ADVANCED_FILTERS,
} from '@/features/bookings/schemas/bookingFilterSchema';

test('accepts empty and one-sided date ranges', () => {
  expect(
    bookingFilterSchema.safeParse(EMPTY_BOOKING_ADVANCED_FILTERS).success,
  ).toBe(true);
  expect(
    bookingFilterSchema.safeParse({
      ...EMPTY_BOOKING_ADVANCED_FILTERS,
      date_to: '2027-12-31',
    }).success,
  ).toBe(true);
});

test('rejects inverted or invalid calendar ranges', () => {
  expect(
    bookingFilterSchema.safeParse({
      ...EMPTY_BOOKING_ADVANCED_FILTERS,
      date_from: '2027-12-31',
      date_to: '2027-11-01',
    }).success,
  ).toBe(false);
  expect(
    bookingFilterSchema.safeParse({
      ...EMPTY_BOOKING_ADVANCED_FILTERS,
      date_from: '2027-02-30',
    }).success,
  ).toBe(false);
});
