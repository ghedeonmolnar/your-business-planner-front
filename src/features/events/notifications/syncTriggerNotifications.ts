import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { reportError } from '@/shared/monitoring/reportError';

export type PlannedNotification = {
  id: string;
  timestamp: number;
  title: string;
  body: string;
  eventId: string;
};

export const ensureChannel = (id: string, name: string) =>
  notifee.createChannel({
    id,
    name,
    importance: AndroidImportance.HIGH,
  });

const createTriggerNotification = (
  notification: PlannedNotification,
  channelId: string,
) => {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notification.timestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  return notifee.createTriggerNotification(
    {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
      data: {
        event_id: notification.eventId,
      },
    },
    trigger,
  );
};

export const syncTriggerNotifications = async (
  idPrefix: string,
  channelId: string,
  planned: PlannedNotification[],
) => {
  const plannedIds = new Set(planned.map(notification => notification.id));
  const scheduledIds = await notifee.getTriggerNotificationIds();
  const staleIds = scheduledIds.filter(
    id => id.startsWith(idPrefix) && !plannedIds.has(id),
  );

  if (staleIds.length) {
    await notifee.cancelTriggerNotifications(staleIds);
  }

  const results = await Promise.allSettled(
    planned.map(notification =>
      createTriggerNotification(notification, channelId),
    ),
  );
  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (rejected.length) {
    reportError(rejected[0].reason, {
      source: 'trigger-notifications',
      prefix: idPrefix,
      failed: rejected.length,
      planned: planned.length,
    });
  }

  return planned.length - rejected.length;
};
