import dayjs from 'dayjs';
import 'dayjs/locale/ro';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('ro');

const COMPANY_TIMEZONE = 'Europe/Bucharest';
const COMPANY_INPUT_FORMAT = 'YYYY-MM-DD HH:mm';

export const companyNow = () => dayjs().tz(COMPANY_TIMEZONE);

export const toCompanyTimestamp = (value: string): string | null => {
  if (!dayjs(value, COMPANY_INPUT_FORMAT, true).isValid()) {
    return null;
  }
  const parsed = dayjs.tz(value, COMPANY_INPUT_FORMAT, COMPANY_TIMEZONE);
  return parsed.format(COMPANY_INPUT_FORMAT) === value
    ? parsed.toISOString()
    : null;
};

export const formatCompanyInput = (value?: string | null) =>
  value ? dayjs(value).tz(COMPANY_TIMEZONE).format(COMPANY_INPUT_FORMAT) : '';

export const formatCompanyDateTime = (value?: string | null) =>
  value
    ? dayjs(value).tz(COMPANY_TIMEZONE).format('DD.MM.YYYY HH:mm')
    : 'Program necompletat';

const TIME_REFERENCE_DATE = '2000-01-01';

const capitalizedMonth = (date: dayjs.Dayjs) => {
  const month = date.format('MMMM');

  return `${month.charAt(0).toUpperCase()}${month.slice(1)}`;
};

export const formatLongDate = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = dayjs(value);

  return date.isValid()
    ? `${date.format('D')} ${capitalizedMonth(date)}, ${date.format('YYYY')}`
    : value;
};

export const formatDayMonthDate = (value: string) => {
  const date = dayjs(value);

  return date.isValid() ? date.format('D MMMM').toLowerCase() : value;
};

export const formatCompactTimeRange = (
  start?: string | null,
  end?: string | null,
) => {
  if (!start || !end) {
    return null;
  }

  const times = [start, end].map(time =>
    dayjs(`${TIME_REFERENCE_DATE}T${time}`),
  );

  if (times.some(time => !time.isValid())) {
    return null;
  }

  return times
    .map(time => time.format(time.minute() === 0 ? 'H' : 'HH:mm'))
    .join('-');
};

export const formatDateTime = (value: string) => {
  const date = dayjs(value);

  return date.isValid() ? date.format('DD.MM.YYYY HH:mm') : value;
};

export const formatMonthLabel = (value: string) => {
  const date = dayjs(`${value}-01`);

  return date.isValid()
    ? `${capitalizedMonth(date)} ${date.format('YYYY')}`
    : value;
};

export const formatEventDate = (
  dateStr: string,
  start?: string | null,
  end?: string | null,
) => {
  const date = dayjs(dateStr);
  const formattedStart = start
    ? dayjs(`${TIME_REFERENCE_DATE}T${start}`).format('HH:mm')
    : null;
  const formattedEnd = end
    ? dayjs(`${TIME_REFERENCE_DATE}T${end}`).format('HH:mm')
    : null;
  const timeLabel =
    formattedStart && formattedEnd
      ? `de la ${formattedStart} la ${formattedEnd}`
      : 'Ora necompletată';

  if (date.isToday()) {
    return `Astăzi · ${timeLabel}`;
  }

  if (date.isTomorrow()) {
    return `Mâine · ${timeLabel}`;
  }

  const weekday = date.format('dddd');
  const formattedDate = date.format('DD.MM');
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${formattedDate} ${capitalizedWeekday} · ${timeLabel}`;
};

export const formatEventDayLabel = (dateStr: string) => {
  const date = dayjs(dateStr);

  if (date.isToday()) {
    return 'Astăzi';
  }

  if (date.isTomorrow()) {
    return 'Mâine';
  }

  if (date.isYesterday()) {
    return 'Ieri';
  }

  const label = `${date.format('D')} ${capitalizedMonth(date)}`;

  return date.year() === dayjs().year() ? label : `${label} ${date.year()}`;
};

export const formatEventSchedule = (
  dateStr: string,
  start?: string | null,
  end?: string | null,
) => {
  const dayLabel = formatEventDayLabel(dateStr);
  const formattedStart = start
    ? dayjs(`${TIME_REFERENCE_DATE}T${start}`).format('HH:mm')
    : null;
  const formattedEnd = end
    ? dayjs(`${TIME_REFERENCE_DATE}T${end}`).format('HH:mm')
    : null;

  if (!formattedStart) {
    return `${dayLabel}, ora necompletată`;
  }

  return formattedEnd
    ? `${dayLabel} de la ora ${formattedStart} până la ${formattedEnd}`
    : `${dayLabel} de la ora ${formattedStart}`;
};
