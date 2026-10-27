import type { PlannedNotification } from '@/features/events/notifications/syncTriggerNotifications';

export const MAXIMUM_SCHEDULED_REMINDERS = 40;

export const reminderWindow = (planned: PlannedNotification[]) => {
  const ordered = [...planned].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
  return {
    selected: ordered.slice(0, MAXIMUM_SCHEDULED_REMINDERS),
    deferred: Math.max(0, ordered.length - MAXIMUM_SCHEDULED_REMINDERS),
  };
};
