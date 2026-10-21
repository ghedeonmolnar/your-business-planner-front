import { logoutApi } from '@/features/auth/api/authApi';
import { SignOutOptions } from '@/features/auth/types';
import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { isUnauthorizedError } from '@/shared/api/client';
import { reportError } from '@/shared/monitoring/reportError';
import { clearAuthToken } from '@/shared/storage/authTokenStorage';

export async function endAuthSession(options?: SignOutOptions): Promise<void> {
  if (options?.remote !== false) {
    try {
      await logoutApi();
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        reportError(error, { source: 'logout' });
      }
    }
  }

  try {
    await clearAuthToken();
  } catch (error) {
    reportError(error, { source: 'clear-auth-token' });
  }
  try {
    await clearEventReminders();
  } catch (error) {
    reportError(error, { source: 'clear-event-reminders' });
  }
}
