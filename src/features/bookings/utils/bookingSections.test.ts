import { bookingSections } from '@/features/bookings/utils/bookingSections';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('groups by event month and keeps the server ordering and totals while pages are incomplete', () => {
  const december = { ...plannerBooking, id: 'december', date: '2027-12-01' };
  const result = bookingSections(
    [december, plannerBooking],
    [
      { month: '2027-11', total: 8 },
      { month: '2027-12', total: 12 },
    ],
    new Set(),
  );
  expect(result.map(section => [section.key, section.total])).toEqual([
    ['2027-12', 12],
    ['2027-11', 8],
  ]);
  expect(result[1].data).toEqual([plannerBooking]);
});

test('collapsing a month retains the full filtered count and grouping metadata', () => {
  expect(
    bookingSections(
      [plannerBooking],
      [{ month: '2027-11', total: 8 }],
      new Set(['2027-11']),
    ),
  ).toEqual([{ key: '2027-11', title: 'Noiembrie 2027', total: 8, data: [] }]);
});
