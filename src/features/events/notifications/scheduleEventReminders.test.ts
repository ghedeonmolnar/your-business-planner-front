import notifee from '@notifee/react-native';
import dayjs from 'dayjs';
import { Event } from '@/features/events/types';
import { resetNotificationPermissionState } from '@/features/events/notifications/notificationPermissions';
import {
  scheduleEmployeeEventReminders,
  scheduleEventReminders,
} from '@/features/events/notifications/scheduleEventReminders';
import { confirmAction } from '@/shared/feedback/confirmAction';

jest.mock('@/shared/feedback/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

const createEvent = (): Event =>
  ({
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
  }) as Event;

const mockPermission = (alarm: number) => {
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    authorizationStatus: 1,
    android: { alarm },
  });
  (notifee.requestPermission as jest.Mock).mockResolvedValue({
    authorizationStatus: 1,
    android: { alarm },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
  resetNotificationPermissionState();
});

test('schedules both reminder sets when the permissions are granted', async () => {
  mockPermission(1);

  await expect(scheduleEventReminders([createEvent()])).resolves.toBe(true);
  expect(notifee.createTriggerNotification).toHaveBeenCalled();
});

test('schedules nothing while the exact alarm access is missing', async () => {
  mockPermission(0);

  await expect(scheduleEventReminders([createEvent()])).resolves.toBe(false);
  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  expect(confirmAction).toHaveBeenCalledTimes(1);
});

test('employee reminders drop leftover payment reminders and schedule only start reminders', async () => {
  mockPermission(1);
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
    'event-payment-old-event',
  ]);

  await expect(scheduleEmployeeEventReminders([createEvent()])).resolves.toBe(true);

  const scheduledIds = (notifee.createTriggerNotification as jest.Mock).mock.calls.map(
    ([notification]) => notification.id,
  );
  expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith(['event-payment-old-event']);
  expect(scheduledIds).toEqual([
    'event-start-event-1-24h',
    'event-start-event-1-6h',
    'event-start-event-1-1h',
  ]);
});

test('checks permissions once for both reminder sets', async () => {
  mockPermission(1);

  await scheduleEventReminders([createEvent()]);

  expect(notifee.getNotificationSettings).toHaveBeenCalledTimes(1);
  expect(notifee.requestPermission).not.toHaveBeenCalled();
});
