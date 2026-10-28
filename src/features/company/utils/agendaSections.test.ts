import { buildAgendaSections } from '@/features/company/utils/agendaSections';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

const REFERENCE_TIME = Date.parse('2027-11-12T08:00:00Z');

test('grupează toate rezervările active din prima zi și exclude stările inactive', () => {
  const bookings = [
    { ...plannerBooking, id: 'cancelled', status: 'cancelled' as const },
    plannerBooking,
    {
      ...plannerBooking,
      id: 'tentative',
      status: 'tentative' as const,
      expires_at: '2027-11-12T10:00:00Z',
    },
    { ...plannerBooking, id: 'expired', status: 'expired' as const },
    { ...plannerBooking, id: 'completed', status: 'completed' as const },
    {
      ...plannerBooking,
      id: 'next-year',
      date: '2028-11-01',
      starts_at: '2028-11-01T16:00:00Z',
      ends_at: '2028-11-02T02:00:00Z',
    },
  ];
  const sections = buildAgendaSections(bookings, new Set(), REFERENCE_TIME);
  expect(
    sections.map(section => [section.key, section.count, section.featured]),
  ).toEqual([
    ['next:2027-11-13', 2, true],
    ['2028-11', 1, false],
  ]);
  expect(sections[0].data.map(booking => booking.id)).toEqual([
    plannerBooking.id,
    'tentative',
  ]);
  expect(
    sections.flatMap(section => section.data.map(booking => booking.id)),
  ).toEqual([plannerBooking.id, 'tentative', 'next-year']);
});

test('elimină expirările și încheierile exact la limita curentă, inclusiv fără răspuns nou de la server', () => {
  const now = Date.parse('2027-11-14T02:00:00Z');
  const bookings = [
    { ...plannerBooking, id: 'ended' },
    {
      ...plannerBooking,
      id: 'expired',
      status: 'tentative' as const,
      expires_at: '2027-11-14T02:00:00Z',
      ends_at: null,
    },
    {
      ...plannerBooking,
      id: 'today',
      date: '2027-11-14',
      starts_at: null,
      ends_at: null,
    },
    { ...plannerBooking, id: 'yesterday', starts_at: null, ends_at: null },
  ];
  const sections = buildAgendaSections(bookings, new Set(), now);
  expect(sections).toHaveLength(1);
  expect(sections[0]).toMatchObject({ featured: true, key: 'next:2027-11-14' });
  expect(sections[0].data.map(booking => booking.id)).toEqual(['today']);
});

test('luna restrânsă păstrează numărătoarea și rezervările din alte luni', () => {
  const result = buildAgendaSections(
    [
      plannerBooking,
      { ...plannerBooking, id: 'same-day' },
      {
        ...plannerBooking,
        id: 'same-month',
        date: '2027-11-14',
        starts_at: '2027-11-14T16:00:00Z',
        ends_at: '2027-11-15T02:00:00Z',
      },
      {
        ...plannerBooking,
        id: 'next-month',
        date: '2027-12-01',
        starts_at: '2027-12-01T16:00:00Z',
        ends_at: '2027-12-02T02:00:00Z',
      },
    ],
    new Set(['2027-11']),
    REFERENCE_TIME,
  );
  expect(result[0]).toMatchObject({ featured: true, count: 2 });
  expect(result[0].data.map(booking => booking.id)).toEqual([
    plannerBooking.id,
    'same-day',
  ]);
  expect(result[1]).toMatchObject({ count: 1, data: [] });
  expect(result[2].data[0].id).toBe('next-month');
});

test('acceptă pagini fără evenimente active și o singură rezervare viitoare', () => {
  expect(buildAgendaSections([], new Set(), REFERENCE_TIME)).toEqual([]);
  expect(
    buildAgendaSections(
      [{ ...plannerBooking, status: 'cancelled' }],
      new Set(),
      REFERENCE_TIME,
    ),
  ).toEqual([]);
  expect(
    buildAgendaSections([plannerBooking], new Set(), REFERENCE_TIME),
  ).toEqual([
    {
      key: 'next:2027-11-13',
      title: '13 Noiembrie, 2027',
      count: 1,
      featured: true,
      data: [plannerBooking],
    },
  ]);
});

test('la miezul nopții din București mută culoarea pe următoarea zi, chiar dacă evenimentele vechi continuă', () => {
  const bookings = [
    {
      ...plannerBooking,
      id: 'thursday-first',
      date: '2026-10-29',
      starts_at: '2026-10-29T14:00:00Z',
      ends_at: '2026-10-30T02:00:00Z',
    },
    {
      ...plannerBooking,
      id: 'thursday-second',
      date: '2026-10-29',
      starts_at: '2026-10-29T18:00:00Z',
      ends_at: '2026-10-30T03:00:00Z',
    },
    {
      ...plannerBooking,
      id: 'expired-friday',
      date: '2026-10-30',
      status: 'tentative' as const,
      starts_at: '2026-10-30T14:00:00Z',
      ends_at: '2026-10-31T02:00:00Z',
      expires_at: '2026-10-29T20:00:00Z',
    },
    {
      ...plannerBooking,
      id: 'saturday-first',
      date: '2026-10-31',
      starts_at: '2026-10-31T14:00:00Z',
      ends_at: '2026-11-01T02:00:00Z',
    },
    {
      ...plannerBooking,
      id: 'saturday-second',
      date: '2026-10-31',
      starts_at: '2026-10-31T18:00:00Z',
      ends_at: '2026-11-01T03:00:00Z',
    },
  ];
  const beforeMidnight = buildAgendaSections(
    bookings,
    new Set(),
    Date.parse('2026-10-29T21:59:59Z'),
  );
  expect(beforeMidnight[0].data.map(booking => booking.id)).toEqual([
    'thursday-first',
    'thursday-second',
  ]);
  const afterMidnight = buildAgendaSections(
    bookings,
    new Set(),
    Date.parse('2026-10-29T22:00:00Z'),
  );
  expect(afterMidnight[0]).toMatchObject({
    featured: true,
    key: 'next:2026-10-31',
  });
  expect(afterMidnight[0].data.map(booking => booking.id)).toEqual([
    'saturday-first',
    'saturday-second',
  ]);
  expect(afterMidnight[1]).toMatchObject({ featured: false });
  expect(afterMidnight[1].data.map(booking => booking.id)).toEqual([
    'thursday-first',
    'thursday-second',
  ]);
});
