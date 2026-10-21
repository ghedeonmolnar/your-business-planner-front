import notifee from '@notifee/react-native';
import dayjs from 'dayjs';
import { Event } from '@/features/events/types';
import {
  eventPaymentReminderId,
  scheduleEventPaymentReminders,
} from '@/features/events/notifications/eventPaymentReminders';

const createEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'event-1',
  client_id: null,
  employee_id: null,
  mascot_id: null,
  date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
  start_time: '18:00:00',
  end_time: '20:00:00',
  price_per_hour: 200,
  balance_due: 400,
  location: 'Sala Palatului',
  type: 'birthday',
  status: 'confirmed',
  rating: null,
  ...overrides,
});

const scheduledNotifications = () =>
  (notifee.createTriggerNotification as jest.Mock).mock.calls.map(
    ([notification, trigger]) => ({
      id: notification.id,
      body: notification.body,
      eventId: notification.data.event_id,
      timestamp: trigger.timestamp,
    }),
  );

beforeEach(() => {
  jest.clearAllMocks();
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
});

test('schedules the follow up one hour after the event ends', async () => {
  const event = createEvent();

  await scheduleEventPaymentReminders([event]);

  expect(scheduledNotifications()).toEqual([
    {
      id: eventPaymentReminderId(event.id),
      body: 'Felicitări pentru eveniment, nu uita să adaugi plată și recenzie!',
      eventId: event.id,
      timestamp: dayjs(`${event.date}T20:00`).add(1, 'hour').valueOf(),
    },
  ]);
});

test('keeps reminding while the event is paid but not rated', async () => {
  await scheduleEventPaymentReminders([
    createEvent({ balance_due: 0, rating: null }),
  ]);

  expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(1);
});

test('keeps reminding while the event is rated but not paid', async () => {
  await scheduleEventPaymentReminders([createEvent({ rating: 5 })]);

  expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(1);
});

test('schedules nothing once the event is paid and rated', async () => {
  await scheduleEventPaymentReminders([
    createEvent({ balance_due: 0, rating: 4 }),
  ]);

  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('schedules nothing for cancelled events', async () => {
  await scheduleEventPaymentReminders([createEvent({ status: 'cancelled' })]);

  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('cancels the reminder left over from an event that no longer qualifies', async () => {
  const staleId = eventPaymentReminderId('event-removed');

  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
    staleId,
    'event-start-event-1-6h',
  ]);

  await scheduleEventPaymentReminders([
    createEvent({ balance_due: 0, rating: 4 }),
  ]);

  expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith([staleId]);
});
