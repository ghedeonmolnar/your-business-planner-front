const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const displayDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const isRealDate = (year: number, month: number, day: number) => {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const dateToIsoDate = (date: Date) => {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);

  if (digits.length <= 2) {
    return day;
  }

  if (digits.length <= 4) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
};

export const displayDateToIso = (value: string) => {
  const match = displayDatePattern.exec(value);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);

  if (
    numericYear < 1000 ||
    !isRealDate(numericYear, numericMonth, numericDay)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

export const isValidIsoDate = (value: string) => {
  const match = isoDatePattern.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;

  return isRealDate(Number(year), Number(month), Number(day));
};

export const isoDateToDisplay = (value: string) => {
  if (!isValidIsoDate(value)) {
    return '';
  }

  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year}`;
};

export const isIsoDateWithinRange = (
  value: string,
  minimumDate?: string,
  maximumDate?: string,
) =>
  isValidIsoDate(value) &&
  (!minimumDate || value >= minimumDate) &&
  (!maximumDate || value <= maximumDate);
