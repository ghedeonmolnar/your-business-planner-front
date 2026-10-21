import { useEffect, useRef } from 'react';
import {
  useMarkReviewNotificationDelivered,
  useReviewNotifications,
} from '@/features/events/hooks/useEvents';
import { displayReviewNotification } from '@/features/events/notifications/reviewNotifications';
import { reportError } from '@/shared/monitoring/reportError';

type ReviewNotificationsSyncProps = {
  enabled: boolean;
};

export function ReviewNotificationsSync({
  enabled,
}: ReviewNotificationsSyncProps) {
  const notificationsQuery = useReviewNotifications(enabled);
  const { mutateAsync: markDelivered } =
    useMarkReviewNotificationDelivered();
  const processingIds = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || !notificationsQuery.data?.items.length) {
      return;
    }

    let active = true;

    const deliverNotifications = async () => {
      for (const notification of notificationsQuery.data?.items ?? []) {
        if (!active || processingIds.current.has(notification.id)) {
          continue;
        }

        processingIds.current.add(notification.id);

        try {
          const displayed = await displayReviewNotification(notification);

          if (displayed) {
            await markDelivered(notification.id);
          }
        } catch (error) {
          reportError(error, {
            source: 'review-notification',
            reviewId: notification.id,
          });
        } finally {
          processingIds.current.delete(notification.id);
        }
      }
    };

    deliverNotifications();

    return () => {
      active = false;
    };
  }, [
    enabled,
    markDelivered,
    notificationsQuery.data?.items,
    notificationsQuery.dataUpdatedAt,
  ]);

  return null;
}
