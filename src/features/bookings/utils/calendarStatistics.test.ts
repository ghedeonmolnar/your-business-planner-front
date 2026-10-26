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

test('comparația cu zero și scăderea procentuală au etichete finite', () => {
  const previous = getMonthStatistics('2026-11', monthDays('2026-11'));
  const currentDays = monthDays('2026-12');
  currentDays[0] = { ...currentDays[0], confirmed: 1, free: 1 };
  const current = getMonthStatistics('2026-12', currentDays);
  expect(bookingComparison(current, previous)).toBe(
    '1 rezervare în plus față de Noiembrie',
  );
  expect(bookingComparison(previous, current)).toBe(
    'Cu 100% mai puțin decât în Decembrie',
  );
  expect(bookingComparison(previous, getMonthStatistics('2026-10', []))).toBe(
    'Rezervări în această lună',
  );
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
