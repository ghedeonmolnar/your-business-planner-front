import dayjs from 'dayjs';
import {
  formatCompactTimeRange,
  formatDayMonthDate,
  formatEventDayLabel,
  formatEventSchedule,
  formatLongDate,
} from '@/shared/utils/formatDate';

const monthNames = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie',
];

const today = dayjs();
const farSameYear = today.month((today.month() + 6) % 12).date(15);

test('folosește etichete relative pentru zilele apropiate', () => {
  expect(formatEventDayLabel(today.format('YYYY-MM-DD'))).toBe('Astăzi');
  expect(formatEventDayLabel(today.add(1, 'day').format('YYYY-MM-DD'))).toBe(
    'Mâine',
  );
  expect(
    formatEventDayLabel(today.subtract(1, 'day').format('YYYY-MM-DD')),
  ).toBe('Ieri');
});

test('afișează ziua și luna pentru evenimentele îndepărtate', () => {
  expect(formatEventDayLabel(farSameYear.format('YYYY-MM-DD'))).toBe(
    `15 ${monthNames[farSameYear.month()]}`,
  );

  const nextYear = farSameYear.add(1, 'year');

  expect(formatEventDayLabel(nextYear.format('YYYY-MM-DD'))).toBe(
    `15 ${monthNames[nextYear.month()]} ${nextYear.year()}`,
  );
});

test('compune intervalul orar al evenimentului', () => {
  const todayDate = today.format('YYYY-MM-DD');

  expect(formatEventSchedule(todayDate, '16:00', '18:00')).toBe(
    'Astăzi de la ora 16:00 până la 18:00',
  );
  expect(formatEventSchedule(todayDate, '16:00', null)).toBe(
    'Astăzi de la ora 16:00',
  );
  expect(formatEventSchedule(todayDate, null, null)).toBe(
    'Astăzi, ora necompletată',
  );
});

test('scrie data întreagă cu luna în litere', () => {
  expect(formatLongDate('2026-09-18')).toBe('18 Septembrie, 2026');
  expect(formatLongDate('2026-01-01')).toBe('1 Ianuarie, 2026');
});

test('lasă neatinse valorile fără dată', () => {
  expect(formatLongDate(null)).toBe('');
  expect(formatLongDate('')).toBe('');
  expect(formatLongDate('fara data')).toBe('fara data');
});

test('scrie ziua și luna fără etichete relative sau an', () => {
  expect(formatDayMonthDate('2026-10-11')).toBe('11 octombrie');
  expect(formatDayMonthDate('2027-01-01')).toBe('1 ianuarie');
  expect(formatDayMonthDate(today.format('YYYY-MM-DD'))).toBe(
    today.format('D MMMM').toLowerCase(),
  );
});

test('formatează intervalul compact păstrând minutele', () => {
  expect(formatCompactTimeRange('15:00', '17:00')).toBe('15-17');
  expect(formatCompactTimeRange('08:30:00', '10:00:00')).toBe('08:30-10');
  expect(formatCompactTimeRange('15:30', '17:30')).toBe('15:30-17:30');
  expect(formatCompactTimeRange('15:00', null)).toBeNull();
  expect(formatCompactTimeRange(null, null)).toBeNull();
  expect(formatCompactTimeRange('invalid', '17:00')).toBeNull();
});
