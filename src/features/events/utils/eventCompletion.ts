import dayjs from 'dayjs';
import { Event } from '@/features/events/types';

type EventSchedule = Pick<Event, 'date' | 'end_time'>;

export const eventEndTimestamp = (event: EventSchedule) => {
  const endTime = event.end_time?.slice(0, 5);

  if (!endTime) {
    return null;
  }

  const endsAt = dayjs(`${event.date}T${endTime}`);

  return endsAt.isValid() ? endsAt.valueOf() : null;
};

export const hasEventEnded = (event: EventSchedule, now = Date.now()) => {
  const endsAt = eventEndTimestamp(event);

  if (endsAt !== null) {
    return endsAt <= now;
  }

  const endOfDay = dayjs(event.date).endOf('day');

  return endOfDay.isValid() && endOfDay.valueOf() < now;
};
