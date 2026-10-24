/* global jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ injectJavaScript: jest.fn() }));
      return React.createElement(View, { ...props, testID: 'map-web-view' });
    }),
  };
});

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);

require('react-native-reanimated').setUpTests();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => undefined),
  },
}));

jest.mock('react-native-keychain', () => {
  let storedPassword = null;

  return {
    ACCESSIBLE: {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    },
    getGenericPassword: jest.fn(() =>
      storedPassword
        ? Promise.resolve({ username: 'sanctum', password: storedPassword })
        : Promise.resolve(false),
    ),
    resetGenericPassword: jest.fn(() => {
      storedPassword = null;
      return Promise.resolve(true);
    }),
    setGenericPassword: jest.fn((_username, password) => {
      storedPassword = password;
      return Promise.resolve(true);
    }),
  };
});

jest.mock('@react-native-documents/picker', () => ({
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
  },
  isErrorWithCode: jest.fn(error => Boolean(error?.code)),
  pick: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelTriggerNotification: jest.fn(() => Promise.resolve()),
    cancelTriggerNotifications: jest.fn(() => Promise.resolve()),
    createChannel: jest.fn(channel => Promise.resolve(channel.id)),
    createTriggerNotification: jest.fn(() => Promise.resolve()),
    displayNotification: jest.fn(() => Promise.resolve()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    getNotificationSettings: jest.fn(() =>
      Promise.resolve({
        authorizationStatus: 1,
        android: { alarm: 1 },
      }),
    ),
    getTriggerNotificationIds: jest.fn(() => Promise.resolve([])),
    onForegroundEvent: jest.fn(() => () => undefined),
    deleteChannel: jest.fn(() => Promise.resolve()),
    openAlarmPermissionSettings: jest.fn(() => Promise.resolve()),
    requestPermission: jest.fn(() =>
      Promise.resolve({
        authorizationStatus: 1,
        android: { alarm: 1 },
      }),
    ),
  },
  AndroidNotificationSetting: {
    NOT_SUPPORTED: -1,
    DISABLED: 0,
    ENABLED: 1,
  },
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
  },
  EventType: {
    DISMISSED: 0,
    PRESS: 1,
  },
  TriggerType: {
    TIMESTAMP: 0,
  },
}));
