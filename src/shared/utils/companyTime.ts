import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const COMPANY_TIMEZONE = 'Europe/Bucharest';
const COMPANY_INPUT_FORMAT = 'YYYY-MM-DD HH:mm';
const MINIMUM_DATABASE_YEAR = 1000;
const MAXIMUM_DATABASE_YEAR = 9999;
const MINUTES_PER_HOUR = 60;

const companyDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: COMPANY_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const companyDate = (value: dayjs.ConfigType) => {
  const instant = dayjs(value);
  if (!instant.isValid()) {
    return instant;
  }
  const parts = Object.fromEntries(
    companyDateFormatter
      .formatToParts(instant.toDate())
      .map(part => [part.type, part.value]),
  );
  return dayjs.utc(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`,
  );
};

export const companyNow = (value: dayjs.ConfigType = new Date()) =>
  companyDate(value);

const MINUTE_MS = 60_000;
const OFFSET_SAMPLE_DAYS = [-1, 0, 1];

export const companyTimestampOptions = (value: string): string[] => {
  const local = value;
  const format =
    local.length === 'YYYY-MM-DD HH:mm:ss'.length
      ? `${COMPANY_INPUT_FORMAT}:ss`
      : COMPANY_INPUT_FORMAT;
  const wallTime = dayjs.utc(local, format, true);
  if (!wallTime.isValid() || wallTime.year() < MINIMUM_DATABASE_YEAR) {
    return [];
  }
  const offsets = new Set(
    OFFSET_SAMPLE_DAYS.map(days => {
      const sample = wallTime.add(days, 'day');
      return companyDate(sample).valueOf() - sample.valueOf();
    }),
  );
  return [...offsets]
    .map(offset => wallTime.subtract(offset, 'millisecond'))
    .filter(
      instant =>
        instant.year() >= MINIMUM_DATABASE_YEAR &&
        instant.year() <= MAXIMUM_DATABASE_YEAR &&
        companyDate(instant).format(format) === local,
    )
    .map(instant => instant.toISOString())
    .sort();
};

const companyOffset = (value: string) => {
  const instant = dayjs(value);
  const minutes = Math.round(
    (companyDate(instant).valueOf() - instant.valueOf()) / MINUTE_MS,
  );
  const absolute = Math.abs(minutes);
  return `${minutes >= 0 ? '+' : '-'}${String(Math.floor(absolute / MINUTES_PER_HOUR)).padStart(2, '0')}:${String(absolute % MINUTES_PER_HOUR).padStart(2, '0')}`;
};

export const toCompanyTimestamp = (value: string): string | null => {
  const match =
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?)(?: ([+-]\d{2}:\d{2}))?$/.exec(
      value,
    );
  if (!match) {
    return null;
  }
  const options = companyTimestampOptions(match[1]);
  return match[2]
    ? (options.find(option => companyOffset(option) === match[2]) ?? null)
    : options.length === 1
      ? options[0]
      : null;
};

export const formatCompanyInput = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const date = companyDate(value);
  const local = date.format(
    date.second() ? `${COMPANY_INPUT_FORMAT}:ss` : COMPANY_INPUT_FORMAT,
  );
  return companyTimestampOptions(local).length > 1
    ? `${local} ${companyOffset(value)}`
    : local;
};

export const formatCompanyDateTime = (value?: string | null) => {
  if (!value) {
    return 'Program necompletat';
  }
  const [date, ...time] = formatCompanyInput(value).split(' ');
  return `${dayjs(date).format('DD.MM.YYYY')} ${time.join(' ')}`;
};

export const formatCompanyTime = (value?: string | null) => {
  if (!value) {
    return 'Ora necompletată';
  }
  return formatCompanyInput(value).split(' ').slice(1).join(' ');
};

export const formatCompanyLongDateTime = (value?: string | null) => {
  if (!value) return 'Program necompletat';
  const date = companyDate(value);
  if (!date.isValid()) return 'Program necompletat';
  return `${date.locale('ro').format('dddd D MMMM YYYY').toLowerCase()} ora ${formatCompanyTime(value)}`;
};

export const formatCompanyTimeRange = (
  start?: string | null,
  end?: string | null,
  showDayOffset = true,
) => {
  if (!start || !end) {
    return null;
  }
  const from = companyDate(start);
  const to = companyDate(end);
  if (!from.isValid() || !to.isValid()) {
    return null;
  }
  const extraDays = to.startOf('day').diff(from.startOf('day'), 'day');
  const suffix =
    showDayOffset && extraDays > 0
      ? ` (+${extraDays} ${extraDays === 1 ? 'zi' : 'zile'})`
      : '';
  return `${formatCompanyTime(start)} – ${formatCompanyTime(end)}${suffix}`;
};
