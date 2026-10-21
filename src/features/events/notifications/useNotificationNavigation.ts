import { useEffect } from 'react';
import { AppState } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { flushPendingEventNavigation } from '@/shared/navigation/navigationRef';
import { handleNotificationPress } from '@/features/events/notifications/notificationPress';
import { reportError } from '@/shared/monitoring/reportError';

export const useNotificationNavigation = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let active = true;

    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (active) {
          handleNotificationPress(initialNotification?.notification);
        }
      })
      .catch(error => {
        reportError(error, { source: 'notification-initial' });
      });

    const unsubscribeForeground = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (active && type === EventType.PRESS) {
          handleNotificationPress(detail.notification);
        }
      },
    );
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        flushPendingEventNavigation();
      }
    });

    flushPendingEventNavigation();

    return () => {
      active = false;
      unsubscribeForeground();
      appStateSubscription.remove();
    };
  }, [enabled]);
};
