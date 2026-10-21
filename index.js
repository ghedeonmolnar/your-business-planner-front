import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleNotificationPress } from '@/features/events/notifications/notificationPress';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    handleNotificationPress(detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
