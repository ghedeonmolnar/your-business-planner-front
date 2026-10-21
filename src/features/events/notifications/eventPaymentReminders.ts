import notifee from '@notifee/react-native';
import dayjs from 'dayjs';
import { Event } from '@/features/events/types';
import {
  ensureChannel,
  PlannedNotification,
  syncTriggerNotifications,
} from '@/features/events/notifications/syncTriggerNotifications';
import { eventEndTimestamp } from '@/features/events/utils/eventCompletion';
import { toAmount } from '@/shared/utils/money';

const LEGACY_CHANNEL_ID = 'event-payment-reminders';
const CHANNEL_ID = 'event-payment-reminders-v2';
export const EVENT_PAYMENT_REMINDER_PREFIX = 'event-payment-';
const HOURS_AFTER_EVENT = 1;

export const eventPaymentReminderId = (eventId: string) =>
  `${EVENT_PAYMENT_REMINDER_PREFIX}${eventId}`;

const reminderTimestamp = (event: Event) => {
  const endsAt = eventEndTimestamp(event);

  return endsAt === null
    ? null
    : dayjs(endsAt).add(HOURS_AFTER_EVENT, 'hour').valueOf();
};

const isEventClosed = (event: Event) =>
  toAmount(event.balance_due) <= 0 && Boolean(event.rating);

const plannedReminders = (events: Event[], now: number) => {
  const planned: PlannedNotification[] = [];

  events.forEach(event => {
    if (event.status === 'cancelled' || isEventClosed(event)) {
      return;
    }

    const timestamp = reminderTimestamp(event);

    if (!timestamp || timestamp <= now) {
      return;
    }

    planned.push({
      id: eventPaymentReminderId(event.id),
      timestamp,
      title: 'Eveniment terminat',
      body: 'Felicitări pentru eveniment, nu uita să adaugi plată și recenzie!',
      eventId: event.id,
    });
  });

  return planned;
};

export const scheduleEventPaymentReminders = async (events: Event[]) => {
  await notifee.deleteChannel(LEGACY_CHANNEL_ID);
  const channelId = await ensureChannel(CHANNEL_ID, 'Plăți evenimente');

  await syncTriggerNotifications(
    EVENT_PAYMENT_REMINDER_PREFIX,
    channelId,
    plannedReminders(events, Date.now()),
  );
};
