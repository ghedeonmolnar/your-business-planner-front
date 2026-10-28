import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
  NotificationSettings,
} from '@notifee/react-native';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { reportError } from '@/shared/monitoring/reportError';

let alarmAccessAsked = false;
let notificationPermissionRequest: Promise<NotificationSettings> | null = null;

export const resetNotificationPermissionState = () => {
  alarmAccessAsked = false;
  notificationPermissionRequest = null;
};

const getNotificationSettings = async () => {
  const currentSettings = await notifee.getNotificationSettings();

  if (currentSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    return currentSettings;
  }

  notificationPermissionRequest ??= notifee.requestPermission().catch(error => {
    notificationPermissionRequest = null;
    throw error;
  });

  return notificationPermissionRequest;
};

const askForAlarmAccess = () => {
  if (alarmAccessAsked) {
    return;
  }

  alarmAccessAsked = true;

  confirmAction({
    title: 'Activează mementourile',
    message:
      'Android nu lasă aplicația să programeze mementouri pentru evenimente fără accesul la alarme și mementouri.',
    confirmLabel: 'Deschide setările',
    cancelLabel: 'Mai târziu',
    onConfirm: () => {
      return notifee.openAlarmPermissionSettings().catch(error => {
        reportError(error, { source: 'alarm-permission-settings' });
      });
    },
  });
};

export const ensureNotificationPermissions = async () => {
  const settings = await getNotificationSettings();

  if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
    return false;
  }

  if (settings.android.alarm === AndroidNotificationSetting.DISABLED) {
    askForAlarmAccess();

    return false;
  }

  return true;
};

export const ensureDisplayNotificationPermission = async () => {
  const settings = await getNotificationSettings();

  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
};
