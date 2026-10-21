import {
  customerDateRangeSchema,
  customerListItemSchema,
} from '@/features/company/schemas/customerListSchemas';

test('intervalul poate include aceeași zi și o zi bisectă validă', () => {
  expect(
    customerDateRangeSchema.safeParse({
      date_from: '2028-02-29',
      date_to: '2028-02-29',
    }).success,
  ).toBe(true);
});

test.each([
  { date_from: '2027-02-29', date_to: '2027-03-01' },
  { date_from: '2026-11-30', date_to: '2026-11-01' },
  { date_from: '', date_to: '' },
  { date_from: ['2026-11-01'], date_to: '2026-11-30' },
])('intervalul invalid sau de structură greșită este respins', range => {
  expect(customerDateRangeSchema.safeParse(range).success).toBe(false);
});

test.each([undefined, -1, '7', 1.5])(
  'totalul istoric invalid este respins: %s',
  count => {
    expect(
      customerListItemSchema.safeParse({
        id: 'client-1',
        name: 'Ana',
        bookings_count: count,
      }).success,
    ).toBe(false);
  },
);
