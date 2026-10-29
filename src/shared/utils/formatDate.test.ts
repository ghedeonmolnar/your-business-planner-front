import dayjs from 'dayjs';
import {
  formatCompactTimeRange,
  formatDayMonthDate,
  formatEventDayLabel,
  formatEventSchedule,
  formatLongDate,
  companyNow,
  formatCompanyInput,
  formatCompanyDateTime,
  formatCompanyLongDateTime,
  formatCompanyTime,
  toCompanyTimestamp,
} from '@/shared/utils/formatDate';

test('programul complet include ziua reală, luna în română și ora companiei', () => {
  expect(formatCompanyLongDateTime('2026-11-19T18:00:00Z')).toBe(
    'joi 19 noiembrie 2026 ora 20:00',
  );
  expect(formatCompanyLongDateTime('2026-11-20T05:00:00Z')).toBe(
    'vineri 20 noiembrie 2026 ora 07:00',
  );
  expect(formatCompanyLongDateTime('2026-07-18T21:00:00Z')).toBe(
    'duminică 19 iulie 2026 ora 00:00',
  );
  expect(formatCompanyLongDateTime(null)).toBe('Program necompletat');
});

test('formatează datele București fără parsarea textului localizat pe Hermes', () => {
  const localizedDate = jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('21 octombrie 2026, ora 23:30');
  jest.useFakeTimers().setSystemTime(new Date('2026-10-21T21:30:00Z'));
  try {
    expect(companyNow().format('YYYY-MM-DD')).toBe('2026-10-22');
    expect(companyNow().startOf('month').format('YYYY-MM-DD')).toBe(
      '2026-10-01',
    );
    expect(companyNow().endOf('month').format('YYYY-MM-DD')).toBe('2026-10-31');
    expect(formatCompanyInput('2026-10-21T21:30:00Z')).toBe('2026-10-22 00:30');
    expect(formatCompanyDateTime('2026-12-31T22:30:00Z')).toBe(
      '01.01.2027 00:30',
    );
    expect(formatCompanyTime('2026-10-24T15:00:00Z')).toBe('18:00');
    expect(formatCompanyTime('2026-12-31T22:30:00Z')).toBe('00:30');
    expect(formatCompanyTime(null)).toBe('Ora necompletată');
    expect(localizedDate).not.toHaveBeenCalled();
  } finally {
    localizedDate.mockRestore();
    jest.useRealTimers();
  }
});

test('convertește programul firmei și respinge ora inexistentă la trecerea la vară', () => {
  expect(toCompanyTimestamp('2026-07-01 18:00')).toBe(
    '2026-07-01T15:00:00.000Z',
  );
  expect(toCompanyTimestamp('2026-12-01 18:00')).toBe(
    '2026-12-01T16:00:00.000Z',
  );
  expect(toCompanyTimestamp('2026-03-29 03:30')).toBeNull();
  expect(toCompanyTimestamp('2026-02-30 18:00')).toBeNull();
});

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
