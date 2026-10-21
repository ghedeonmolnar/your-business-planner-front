import notifee from '@notifee/react-native';
import {
  ensureDisplayNotificationPermission,
  ensureNotificationPermissions,
  resetNotificationPermissionState,
} from '@/features/events/notifications/notificationPermissions';
import { confirmAction } from '@/shared/feedback/confirmAction';

jest.mock('@/shared/feedback/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

const DENIED = 0;
const AUTHORIZED = 1;
const ALARM_DISABLED = 0;
const ALARM_ENABLED = 1;
const ALARM_NOT_SUPPORTED = -1;

const mockPermission = (authorizationStatus: number, alarm: number) => {
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    authorizationStatus,
    android: { alarm },
  });
  (notifee.requestPermission as jest.Mock).mockResolvedValue({
    authorizationStatus,
    android: { alarm },
  });
};

const pressConfirm = () => {
  jest.mocked(confirmAction).mock.calls[0][0].onConfirm();
};

beforeEach(() => {
  jest.clearAllMocks();
  resetNotificationPermissionState();
});

test('allows scheduling when notifications and exact alarms are granted', async () => {
  mockPermission(AUTHORIZED, ALARM_ENABLED);

  await expect(ensureNotificationPermissions()).resolves.toBe(true);
  expect(confirmAction).not.toHaveBeenCalled();
  expect(notifee.requestPermission).not.toHaveBeenCalled();
});

test('allows scheduling below Android 12, where exact alarms need no access', async () => {
  mockPermission(AUTHORIZED, ALARM_NOT_SUPPORTED);

  await expect(ensureNotificationPermissions()).resolves.toBe(true);
});

test('blocks scheduling and asks for access when exact alarms are disabled', async () => {
  mockPermission(AUTHORIZED, ALARM_DISABLED);

  await expect(ensureNotificationPermissions()).resolves.toBe(false);
  expect(confirmAction).toHaveBeenCalledTimes(1);
});

test('permite notificările imediate fără acces la alarme exacte', async () => {
  mockPermission(AUTHORIZED, ALARM_DISABLED);

  await expect(ensureDisplayNotificationPermission()).resolves.toBe(true);
  expect(confirmAction).not.toHaveBeenCalled();
});

test('opens the alarm settings screen once the user confirms', async () => {
  mockPermission(AUTHORIZED, ALARM_DISABLED);

  await ensureNotificationPermissions();
  pressConfirm();

  expect(notifee.openAlarmPermissionSettings).toHaveBeenCalled();
});

test('asks for alarm access only once per session', async () => {
  mockPermission(AUTHORIZED, ALARM_DISABLED);

  await ensureNotificationPermissions();
  await ensureNotificationPermissions();

  expect(confirmAction).toHaveBeenCalledTimes(1);
});

test('blocks scheduling when notifications are denied', async () => {
  mockPermission(DENIED, ALARM_ENABLED);

  await expect(ensureNotificationPermissions()).resolves.toBe(false);
  expect(confirmAction).not.toHaveBeenCalled();
});

test('reuses one Android permission request during foreground transitions', async () => {
  mockPermission(DENIED, ALARM_ENABLED);

  await Promise.all([
    ensureNotificationPermissions(),
    ensureNotificationPermissions(),
  ]);

  expect(notifee.requestPermission).toHaveBeenCalledTimes(1);
});
