import { buildAgendaSections } from '@/features/company/utils/agendaSections';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('exclude stările inactive și separă următoarea rezervare de lunile rămase', () => {
  const bookings = [
    { ...plannerBooking, id: 'cancelled', status: 'cancelled' as const },
    plannerBooking,
    { ...plannerBooking, id: 'tentative', status: 'tentative' as const },
    { ...plannerBooking, id: 'expired', status: 'expired' as const },
    { ...plannerBooking, id: 'completed', status: 'completed' as const },
    { ...plannerBooking, id: 'next-year', date: '2028-11-01' },
  ];
  const { nextBooking, sections } = buildAgendaSections(bookings, new Set());
  expect(nextBooking?.id).toBe(plannerBooking.id);
  expect(sections.map(section => [section.key, section.count])).toEqual([
    ['2027-11', 1],
    ['2028-11', 1],
  ]);
  expect(
    sections.flatMap(section => section.data.map(booking => booking.id)),
  ).toEqual(['tentative', 'next-year']);
});

test('luna restrânsă păstrează numărătoarea și rezervările din alte luni', () => {
  const result = buildAgendaSections(
    [
      plannerBooking,
      { ...plannerBooking, id: 'same-month' },
      { ...plannerBooking, id: 'next-month', date: '2027-12-01' },
    ],
    new Set(['2027-11']),
  );
  expect(result.sections[0]).toMatchObject({ count: 1, data: [] });
  expect(result.sections[1].data[0].id).toBe('next-month');
});

test('acceptă pagini fără evenimente active și o singură rezervare viitoare', () => {
  expect(buildAgendaSections([], new Set())).toEqual({
    nextBooking: undefined,
    sections: [],
  });
  expect(
    buildAgendaSections(
      [{ ...plannerBooking, status: 'cancelled' }],
      new Set(),
    ),
  ).toEqual({ nextBooking: undefined, sections: [] });
  expect(buildAgendaSections([plannerBooking], new Set())).toEqual({
    nextBooking: plannerBooking,
    sections: [],
  });
});
