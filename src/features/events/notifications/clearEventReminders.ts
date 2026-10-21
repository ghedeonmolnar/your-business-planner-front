import notifee from '@notifee/react-native';
import { EVENT_PAYMENT_REMINDER_PREFIX } from '@/features/events/notifications/eventPaymentReminders';
import { EVENT_START_REMINDER_PREFIX } from '@/features/events/notifications/eventStartReminders';

const cancelRemindersWithPrefixes = async (prefixes: string[]) => {
  const ids = await notifee.getTriggerNotificationIds();
  const matchingIds = ids.filter(id =>
    prefixes.some(prefix => id.startsWith(prefix)),
  );

  if (matchingIds.length) {
    await notifee.cancelTriggerNotifications(matchingIds);
  }
};

export const clearEventReminders = () =>
  cancelRemindersWithPrefixes([
    'booking-',
    EVENT_START_REMINDER_PREFIX,
    EVENT_PAYMENT_REMINDER_PREFIX,
  ]);

export const clearPaymentReminders = () =>
  cancelRemindersWithPrefixes([EVENT_PAYMENT_REMINDER_PREFIX]);
