import dayjs, { Dayjs } from 'dayjs';
import { Event } from '@/features/events/types';
import {
  ensureChannel,
  PlannedNotification,
  syncTriggerNotifications,
} from '@/features/events/notifications/syncTriggerNotifications';

const CHANNEL_ID = 'event-start-reminders';
export const EVENT_START_REMINDER_PREFIX = 'event-start-';
export type StartReminderEvent = Pick<Event, 'id' | 'date' | 'start_time' | 'status' | 'location' | 'address'>;

export const eventStartReminderLeadHours = [24, 6, 1];

export const eventStartReminderId = (eventId: string, leadHours: number) =>
  `${EVENT_START_REMINDER_PREFIX}${eventId}-${leadHours}h`;

const eventStartMoment = (event: StartReminderEvent): Dayjs | null => {
  const startTime = event.start_time?.slice(0, 5);

  if (!startTime) {
    return null;
  }

  const startsAt = dayjs(`${event.date}T${startTime}`);

  return startsAt.isValid() ? startsAt : null;
};

const eventPlace = (event: StartReminderEvent) =>
  [event.location, event.address]
    .map(part => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');

export const eventStartReminderBody = (event: StartReminderEvent, leadHours: number) => {
  const startsAt = eventStartMoment(event);

  if (!startsAt) {
    return null;
  }

  const place = eventPlace(event);
  const startLabel = startsAt.format('HH:mm');

  if (!place) {
    return `Pregătește-te de distracție în ${leadHours}h, de la ${startLabel}.`;
  }

  return `Pregătește-te de distracție în ${leadHours}h la ${place} de la ${startLabel}.`;
};

const plannedReminders = (events: StartReminderEvent[], now: number) => {
  const planned: PlannedNotification[] = [];

  events.forEach(event => {
    if (event.status === 'cancelled') {
      return;
    }

    const startsAt = eventStartMoment(event);

    if (!startsAt) {
      return;
    }

    eventStartReminderLeadHours.forEach(leadHours => {
      const timestamp = startsAt.subtract(leadHours, 'hour').valueOf();
      const body = eventStartReminderBody(event, leadHours);

      if (!body || timestamp <= now) {
        return;
      }

      planned.push({
        id: eventStartReminderId(event.id, leadHours),
        timestamp,
        title: `Eveniment în ${leadHours}h`,
        body,
        eventId: event.id,
      });
    });
  });

  return planned;
};

export const scheduleEventStartReminders = async (events: StartReminderEvent[]) => {
  const channelId = await ensureChannel(CHANNEL_ID, 'Reamintiri evenimente');

  await syncTriggerNotifications(
    EVENT_START_REMINDER_PREFIX,
    channelId,
    plannedReminders(events, Date.now()),
  );
};
