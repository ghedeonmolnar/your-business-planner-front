import { Event } from '@/features/events/types';
import { clearPaymentReminders } from '@/features/events/notifications/clearEventReminders';
import { ensureNotificationPermissions } from '@/features/events/notifications/notificationPermissions';
import { scheduleEventPaymentReminders } from '@/features/events/notifications/eventPaymentReminders';
import {
  scheduleEventStartReminders,
  StartReminderEvent,
} from '@/features/events/notifications/eventStartReminders';

export const scheduleEventReminders = async (events: Event[]) => {
  if (!(await ensureNotificationPermissions())) {
    return false;
  }

  await scheduleEventStartReminders(events);
  await scheduleEventPaymentReminders(events);

  return true;
};

export const scheduleEmployeeEventReminders = async (events: StartReminderEvent[]) => {
  await clearPaymentReminders();

  if (!(await ensureNotificationPermissions())) {
    return false;
  }

  await scheduleEventStartReminders(events);

  return true;
};
