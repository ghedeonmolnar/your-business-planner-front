import { Notification } from '@notifee/react-native';
import { navigateToEventDetails } from '@/shared/navigation/navigationRef';

const eventIdFromData = (data?: Record<string, unknown>) => {
  const eventId = data?.event_id;

  return typeof eventId === 'string' && eventId ? eventId : null;
};

export const handleNotificationPress = (notification?: Notification | null) => {
  const eventId = eventIdFromData(notification?.data);

  if (!eventId) {
    return false;
  }

  navigateToEventDetails(eventId);

  return true;
};
