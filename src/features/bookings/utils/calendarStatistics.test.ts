import dayjs from 'dayjs';
import { CalendarDay } from '@/features/bookings/types';
import {
  bookingComparison,
  getMonthStatistics,
  occupancyLabel,
} from '@/features/bookings/utils/calendarStatistics';

const monthDays = (month: string): CalendarDay[] =>
  Array.from({ length: dayjs(`${month}-01`).daysInMonth() }, (_, index) => ({
    date: dayjs(`${month}-01`).add(index, 'day').format('YYYY-MM-DD'),
    confirmed: 0,
    tentative: 0,
    free: 2,
    active_capacity: 2,
    active_occupied_halls: 0,
  }));

const monthStatistics = (month: string, bookings: number) => ({
  ...getMonthStatistics(month, monthDays(month)),
  bookings,
});

test('continuarea în ziua următoare crește ocuparea fără să dubleze numărul rezervărilor', () => {
  const days = monthDays('2027-01');
  days[0] = {
    ...days[0],
    confirmed: 1,
    free: 1,
    occupied_halls: 1,
    active_occupied_halls: 1,
  };
  days[1] = {
    ...days[1],
    confirmed: 0,
    free: 1,
    occupied_halls: 1,
    active_occupied_halls: 1,
  };
  const statistics = getMonthStatistics('2027-01', days);
  expect(statistics.bookings).toBe(1);
  expect(statistics.freeDays).toBe(29);
  expect(statistics.occupancy).toBeCloseTo(2 / 62);
});

test('numără fiecare weekend o singură dată și păstrează toate rezervările', () => {
  const days = monthDays('2027-01');
  days[1] = {
    ...days[1],
    confirmed: 1,
    tentative: 1,
    free: 0,
    active_occupied_halls: 2,
  };
  days[2] = { ...days[2], confirmed: 1, free: 1, active_occupied_halls: 1 };
  const statistics = getMonthStatistics('2027-01', days);
  expect(statistics).toMatchObject({
    bookings: 3,
    freeDays: 29,
    occupiedWeekends: 1,
    weekends: 5,
    totalDays: 31,
    complete: true,
  });
  expect(statistics.occupancy).toBeCloseTo(3 / 62);
  expect(occupancyLabel(statistics)).toBe('Mai liber');
});

test('include weekendurile parțiale de la marginea lunii și anul bisect', () => {
  const days = monthDays('2026-11');
  days[0] = { ...days[0], confirmed: 1, free: 1, active_occupied_halls: 1 };
  expect(getMonthStatistics('2026-11', days)).toMatchObject({
    weekends: 5,
    occupiedWeekends: 1,
  });
  expect(getMonthStatistics('2028-02', monthDays('2028-02'))).toMatchObject({
    totalDays: 29,
    freeDays: 29,
    complete: true,
  });
});

test('datele lipsă și lipsa sălilor nu produc zile libere inventate', () => {
  expect(getMonthStatistics('2026-11', [])).toMatchObject({
    complete: false,
    hasHalls: false,
    freeDays: 0,
  });
  const days = monthDays('2026-11').map(day => ({
    ...day,
    free: 0,
    active_capacity: 0,
  }));
  expect(occupancyLabel(getMonthStatistics('2026-11', days))).toBe('Fără săli');
});

test('prioritizează creșterea față de luna precedentă și precizează anul', () => {
  expect(
    bookingComparison(
      monthStatistics('2027-01', 120),
      monthStatistics('2026-12', 100),
      monthStatistics('2026-01', 60),
    ),
  ).toBe('+20% față de Decembrie 2026');
});

test('arată creșterea anuală când totalul lunar a scăzut sau a rămas egal', () => {
  const current = monthStatistics('2027-11', 60);
  const lastYear = monthStatistics('2026-11', 40);
  expect(
    bookingComparison(current, monthStatistics('2027-10', 100), lastYear),
  ).toBe('+50% față de Noiembrie 2026');
  expect(
    bookingComparison(current, monthStatistics('2027-10', 60), lastYear),
  ).toBe('+50% față de Noiembrie 2026');
});

test('folosește un text neutru când nu există creștere sau istoric', () => {
  const current = monthStatistics('2027-11', 60);
  const previous = monthStatistics('2027-10', 100);
  for (const lastYear of [
    undefined,
    monthStatistics('2026-11', 60),
    monthStatistics('2026-11', 80),
    monthStatistics('2026-11', 0),
    getMonthStatistics('2026-11', []),
    monthStatistics('2026-10', 20),
    monthStatistics('2025-11', 20),
  ]) {
    expect(bookingComparison(current, previous, lastYear)).toBe(
      'Rezervări în această lună',
    );
  }
});

test('nu compară date incomplete sau alte luni decât perioadele cerute', () => {
  expect(
    bookingComparison(
      getMonthStatistics('2027-11', []),
      monthStatistics('2027-10', 0),
      monthStatistics('2026-11', 10),
    ),
  ).toBe('Rezervări în această lună');
  expect(
    bookingComparison(
      monthStatistics('2027-11', 60),
      monthStatistics('2027-09', 10),
    ),
  ).toBe('Rezervări în această lună');
  expect(
    bookingComparison(
      monthStatistics('2027-11', 60),
      getMonthStatistics('2027-10', []),
      monthStatistics('2026-11', 40),
    ),
  ).toBe('+50% față de Noiembrie 2026');
});

test('exprimă în rezervări creșterile de la zero sau cele rotunjite sub un procent', () => {
  expect(
    bookingComparison(
      monthStatistics('2026-12', 1),
      monthStatistics('2026-11', 0),
    ),
  ).toBe('1 rezervare în plus față de Noiembrie 2026');
  expect(
    bookingComparison(
      monthStatistics('2026-12', 2),
      monthStatistics('2026-11', 0),
    ),
  ).toBe('2 rezervări în plus față de Noiembrie 2026');
  expect(
    bookingComparison(
      monthStatistics('2026-12', 1001),
      monthStatistics('2026-11', 1000),
    ),
  ).toBe('1 rezervare în plus față de Noiembrie 2026');
});

test('ocuparea istorică nu inventează capacitate când nu există săli active', () => {
  const days = monthDays('2027-01').map(day => ({
    ...day,
    free: 0,
    active_capacity: 0,
    active_occupied_halls: 0,
    occupied_halls: 1,
    historical_occupied_halls: 1,
    confirmed: 1,
  }));
  const statistics = getMonthStatistics('2027-01', days);
  expect(statistics.hasHalls).toBe(false);
  expect(statistics.occupancy).toBe(0);
  expect(occupancyLabel(statistics)).toBe('Fără săli');
});

test('procentul anual folosește exclusiv ocuparea și capacitatea activă în combinația cu istoric', () => {
  const days = monthDays('2027-01').map(day => ({
    ...day,
    occupied_halls: 1,
    historical_occupied_halls: 1,
  }));
  days[0] = {
    ...days[0],
    occupied_halls: 2,
    active_occupied_halls: 1,
    free: 1,
  };
  expect(getMonthStatistics('2027-01', days).occupancy).toBeCloseTo(1 / 62);
});
