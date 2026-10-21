import dayjs from 'dayjs';
import { Event } from '@/features/events/types';

type ReservationSchedule = Pick<Event, 'date' | 'start_time' | 'status'>;

export const eventReservationShareDeadline = (event: ReservationSchedule) => {
  const startsAt = event.start_time
    ? dayjs(`${event.date}T${event.start_time}`)
    : dayjs(event.date).endOf('day');

  return startsAt.isValid() ? startsAt.valueOf() : null;
};

export const canShareEventReservation = (
  event: ReservationSchedule,
  role?: string,
  now = Date.now(),
) => {
  const deadline = eventReservationShareDeadline(event);

  return (
    role === 'admin' &&
    event.status !== 'cancelled' &&
    event.status !== 'completed' &&
    deadline !== null &&
    deadline > now
  );
};
