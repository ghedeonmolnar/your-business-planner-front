import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/shared/navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingEventId: string | null = null;

export const clearPendingEventNavigation = () => {
  pendingEventId = null;
};

export const navigateToEventDetails = (eventId: string) => {
  if (
    !navigationRef.isReady()
    || !navigationRef.getRootState()?.routeNames.includes('EventDetails')
  ) {
    pendingEventId = eventId;

    return false;
  }

  navigationRef.navigate('EventDetails', { eventId });

  return true;
};

export const flushPendingEventNavigation = () => {
  if (
    !pendingEventId ||
    !navigationRef.isReady() ||
    !navigationRef.getRootState()?.routeNames.includes('EventDetails')
  ) {
    return false;
  }

  const eventId = pendingEventId;
  pendingEventId = null;
  navigationRef.navigate('EventDetails', { eventId });

  return true;
};
