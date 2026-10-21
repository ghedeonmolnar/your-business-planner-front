import {
  displayDateToIso,
  formatDateInput,
  isIsoDateWithinRange,
  isValidIsoDate,
  isoDateToDisplay,
} from '@/shared/utils/dateInput';

test('date input formats typed digits as day, month and year', () => {
  expect(formatDateInput('21082026')).toBe('21/08/2026');
  expect(formatDateInput('21 / 08 / 2026')).toBe('21/08/2026');
});

test('date input converts only real calendar dates', () => {
  expect(displayDateToIso('29/02/2028')).toBe('2028-02-29');
  expect(displayDateToIso('31/02/2028')).toBeNull();
  expect(isValidIsoDate('2028-02-29')).toBe(true);
  expect(isValidIsoDate('2028-02-31')).toBe(false);
  expect(isoDateToDisplay('2028-02-29')).toBe('29/02/2028');
});

test('date range validation includes both limits', () => {
  expect(isIsoDateWithinRange('2026-08-21', '2026-08-21', '2026-08-30')).toBe(
    true,
  );
  expect(isIsoDateWithinRange('2026-08-20', '2026-08-21', '2026-08-30')).toBe(
    false,
  );
});
