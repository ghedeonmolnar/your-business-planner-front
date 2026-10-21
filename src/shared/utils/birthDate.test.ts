import {
  buildBirthDate,
  getDaysInMonth,
  isLeapYear,
  splitBirthDate,
} from '@/shared/utils/birthDate';

describe('birth date utilities', () => {
  it('handles leap years, including century rules', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('returns the correct number of days for each selected month', () => {
    expect(getDaysInMonth('2024', '02')).toBe(29);
    expect(getDaysInMonth('2023', '02')).toBe(28);
    expect(getDaysInMonth('2024', '04')).toBe(30);
    expect(getDaysInMonth('2024', '12')).toBe(31);
  });

  it('builds only valid ISO birth dates', () => {
    expect(buildBirthDate('2024', '02', '29')).toBe('2024-02-29');
    expect(buildBirthDate('2023', '02', '29')).toBeNull();
    expect(buildBirthDate('2024', '04', '31')).toBeNull();
  });

  it('splits existing ISO dates for editing', () => {
    expect(splitBirthDate('1995-08-07')).toEqual({
      year: '1995',
      month: '08',
      day: '07',
    });
  });
});
