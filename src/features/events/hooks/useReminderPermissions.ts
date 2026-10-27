import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';
import { reportError } from '@/shared/monitoring/reportError';

type PermissionSummary = {
  notifications: boolean;
  alarms: boolean;
  scheduled: number;
};
export function useReminderPermissions() {
  const [summary, setSummary] = useState<PermissionSummary>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    let sequence = 0;
    const refresh = async () => {
      const current = ++sequence;
      try {
        const [settings, identifiers] = await Promise.all([
          notifee.getNotificationSettings(),
          notifee.getTriggerNotificationIds(),
        ]);
        if (!mounted || current !== sequence) return;
        setSummary({
          notifications:
            settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
          alarms:
            settings.android.alarm !== AndroidNotificationSetting.DISABLED,
          scheduled: identifiers.filter(id => id.startsWith('booking-')).length,
        });
        setError(false);
      } catch (failure) {
        if (mounted && current === sequence) setError(true);
        reportError(failure, { source: 'reminder-permissions' });
      }
    };
    void refresh();
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh();
    });
    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);
  return { summary, error };
}
