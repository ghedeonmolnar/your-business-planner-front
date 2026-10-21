import notifee from '@notifee/react-native';
import { ensureDisplayNotificationPermission } from '@/features/events/notifications/notificationPermissions';
import { ensureChannel } from '@/features/events/notifications/syncTriggerNotifications';
import { ReviewNotification } from '@/features/events/types';

const REVIEW_CHANNEL_ID = 'client-reviews';

export const displayReviewNotification = async (
  notification: ReviewNotification,
) => {
  if (!(await ensureDisplayNotificationPermission())) {
    return false;
  }

  const channelId = await ensureChannel(REVIEW_CHANNEL_ID, 'Recenzii clienți');

  await notifee.displayNotification({
    id: `event-review-${notification.id}`,
    title: 'Review nou',
    body: `Clientul ${notification.reviewer_name} ți-a lăsat un review.`,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
    data: {
      event_id: notification.event_id,
    },
  });

  return true;
};
