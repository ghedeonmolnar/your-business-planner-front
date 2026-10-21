const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export type BirthDateParts = {
  year: string;
  month: string;
  day: string;
};

export const isLeapYear = (year: number) =>
  year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

export const getDaysInMonth = (year: string, month: string) => {
  const numericMonth = Number(month);

  if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    return null;
  }

  if (numericMonth === 2) {
    const numericYear = Number(year);

    return year.length === 4 && Number.isInteger(numericYear)
      ? isLeapYear(numericYear)
        ? 29
        : 28
      : 29;
  }

  return [4, 6, 9, 11].includes(numericMonth) ? 30 : 31;
};

export const splitBirthDate = (value: string): BirthDateParts => {
  const match = isoDatePattern.exec(value);

  if (!match) {
    return { year: '', month: '', day: '' };
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
  };
};

export const buildBirthDate = (
  year: string,
  month: string,
  day: string,
) => {
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{1,2}$/.test(day)) {
    return null;
  }

  const numericYear = Number(year);
  const numericDay = Number(day);
  const maximumDay = getDaysInMonth(year, month);

  if (numericYear < 1 || !maximumDay || numericDay < 1 || numericDay > maximumDay) {
    return null;
  }

  return `${year}-${month}-${String(numericDay).padStart(2, '0')}`;
};
