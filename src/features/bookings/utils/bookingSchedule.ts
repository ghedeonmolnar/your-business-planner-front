import dayjs from 'dayjs';
import { SelectOption } from '@/shared/components/ControlledSelectField';
import {
  companyTimestampOptions,
  formatCompanyInput,
  toCompanyTimestamp,
} from '@/shared/utils/formatDate';
import { isValidIsoDate } from '@/shared/utils/dateInput';

const inputTime = (value: string) => value.split(' ').slice(1).join(' ');

export const bookingClock = (value: string) => inputTime(value).slice(0, 5);

const inputAtDate = (date: string, time: string) => {
  if (!date || !time) return '';
  const clock = time.replace(/ [+-]\d{2}:\d{2}$/, '');
  const options = companyTimestampOptions(`${date} ${clock}`);
  return options.length === 1
    ? formatCompanyInput(options[0])
    : `${date} ${time}`;
};

export function bookingScheduleInputs(
  date: string,
  start: string,
  end: string,
) {
  const startTime = inputTime(start);
  const endTime = inputTime(end);
  const startsAt = inputAtDate(date, startTime);
  const sameDayEnd = inputAtDate(date, endTime);
  const startInstant = toCompanyTimestamp(startsAt);
  const endInstant = toCompanyTimestamp(sameDayEnd);
  const nextDay =
    startInstant && endInstant
      ? Date.parse(endInstant) <= Date.parse(startInstant)
      : Boolean(
          startTime && endTime && endTime.slice(0, 5) <= startTime.slice(0, 5),
        );
  return {
    starts_at: startsAt,
    ends_at: inputAtDate(
      nextDay && date ? dayjs(date).add(1, 'day').format('YYYY-MM-DD') : date,
      endTime,
    ),
  };
}

export function bookingTimeChoices(
  date: string,
  time: string,
  start = '',
  end = false,
): SelectOption<string>[] {
  if (!isValidIsoDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    return [];
  const sameDay = `${date} ${time}`;
  const startInstant = toCompanyTimestamp(start);
  const sameDayOptions = companyTimestampOptions(sameDay);
  const laterOptions =
    end && startInstant
      ? sameDayOptions.filter(
          instant => Date.parse(instant) > Date.parse(startInstant),
        )
      : [];
  const local =
    end && !laterOptions.length && time <= bookingClock(start)
      ? `${dayjs(date).add(1, 'day').format('YYYY-MM-DD')} ${time}`
      : sameDay;
  const options = laterOptions.length
    ? laterOptions
    : companyTimestampOptions(local);
  return options.map((instant, occurrence) => {
    const occurrenceLabel =
      options.length > 1
        ? [' · prima apariție', ' · a doua apariție'][occurrence]
        : '';
    const dayLabel = local.slice(0, 10) !== date ? ' · a doua zi' : '';
    return {
      id: formatCompanyInput(instant),
      name: `${time}${occurrenceLabel}${dayLabel}`,
    };
  });
}
