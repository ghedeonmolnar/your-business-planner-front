import notifee from '@notifee/react-native';
import dayjs from 'dayjs';
import { Event } from '@/features/events/types';
import {
  eventStartReminderId,
  scheduleEventStartReminders,
} from '@/features/events/notifications/eventStartReminders';

const createEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-1',
  client_id: null,
  employee_id: null,
  mascot_id: null,
  date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
  start_time: '18:00:00',
  end_time: '20:00:00',
  price_per_hour: 200,
  location: 'Sala Palatului',
  address: 'Str. Ion Campineanu 28, Bucuresti',
  type: 'birthday',
  status: 'confirmed',
  ...overrides,
});

const scheduledNotifications = () =>
  (notifee.createTriggerNotification as jest.Mock).mock.calls.map(
    ([notification, trigger]) => ({
      id: notification.id,
      body: notification.body,
      timestamp: trigger.timestamp,
    }),
  );

beforeEach(() => {
  jest.clearAllMocks();
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
});

test('schedules a reminder 24h, 6h and 1h before the event starts', async () => {
  const event = createEvent();
  const startsAt = dayjs(`${event.date}T18:00`);

  await scheduleEventStartReminders([event]);

  expect(scheduledNotifications()).toEqual(
    [24, 6, 1].map(leadHours => ({
      id: eventStartReminderId(event.id, leadHours),
      body: `Pregătește-te de distracție în ${leadHours}h la Sala Palatului, Str. Ion Campineanu 28, Bucuresti de la 18:00.`,
      timestamp: startsAt.subtract(leadHours, 'hour').valueOf(),
    })),
  );
});

test('keeps only the location when the event has no address', async () => {
  await scheduleEventStartReminders([createEvent({ address: null })]);

  expect(scheduledNotifications()[0].body).toBe(
    'Pregătește-te de distracție în 24h la Sala Palatului de la 18:00.',
  );
});

test('schedules nothing for cancelled events', async () => {
  await scheduleEventStartReminders([createEvent({ status: 'cancelled' })]);

  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('skips lead times that are already in the past', async () => {
  const event = createEvent({
    date: dayjs().add(4, 'hour').format('YYYY-MM-DD'),
    start_time: dayjs().add(4, 'hour').format('HH:mm:ss'),
  });

  await scheduleEventStartReminders([event]);

  expect(scheduledNotifications().map(notification => notification.id)).toEqual(
    [eventStartReminderId(event.id, 1)],
  );
});

test('cancels reminders left over from events that no longer qualify', async () => {
  const event = createEvent();
  const staleId = eventStartReminderId('event-removed', 6);

  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
    staleId,
    eventStartReminderId(event.id, 24),
    'event-payment-event-1',
  ]);

  await scheduleEventStartReminders([event]);

  expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith([staleId]);
});
