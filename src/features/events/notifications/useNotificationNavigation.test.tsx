import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import notifee, { InitialNotification } from '@notifee/react-native';
import { useNotificationNavigation } from '@/features/events/notifications/useNotificationNavigation';
import { handleNotificationPress } from '@/features/events/notifications/notificationPress';

jest.mock('@/features/events/notifications/notificationPress', () => ({
  handleNotificationPress: jest.fn(),
}));
jest.mock('@/shared/navigation/navigationRef', () => ({
  flushPendingEventNavigation: jest.fn(),
}));

function NotificationNavigation({ enabled }: { enabled: boolean }) {
  useNotificationNavigation(enabled);
  return null;
}

test('an initial notification resolved after logout cannot queue account navigation', async () => {
  let finishInitialNotification: (
    value: InitialNotification | null,
  ) => void = () => undefined;
  jest.mocked(notifee.getInitialNotification).mockReturnValueOnce(
    new Promise(resolve => {
      finishInitialNotification = resolve;
    }),
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<NotificationNavigation enabled />);
  });
  await ReactTestRenderer.act(async () => {
    renderer?.update(<NotificationNavigation enabled={false} />);
  });
  await ReactTestRenderer.act(async () => {
    finishInitialNotification({
      notification: { id: 'old-notification', data: { eventId: 'old-event' } },
      pressAction: { id: 'default' },
    });
  });
  expect(handleNotificationPress).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
