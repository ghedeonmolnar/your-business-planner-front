import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { useBookingReminders } from '@/features/bookings/hooks/useBookingReminders';
import { ensureNotificationPermissions } from '@/features/events/notifications/notificationPermissions';
import {
  ensureChannel,
  PlannedNotification,
  syncTriggerNotifications,
} from '@/features/events/notifications/syncTriggerNotifications';
import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { reportError } from '@/shared/monitoring/reportError';
import { useAuth } from '@/features/auth/AuthProvider';

const LEAD_HOURS = [24, 6, 1];
const MAXIMUM_SCHEDULED_REMINDERS = 40;
let syncQueue: Promise<unknown> = Promise.resolve();

export function EventRemindersSync({
  enabled,
  role,
}: {
  enabled: boolean;
  role: 'owner' | 'admin' | 'employee';
}) {
  const { user } = useAuth();
  const financeEnabled = hasCompanyFeature(user, 'finance');
  const subscriptionEnd = user?.subscription?.ends_at
    ? Date.parse(user.subscription.ends_at)
    : Number.POSITIVE_INFINITY;
  const events = useBookingReminders(enabled).data;
  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      syncQueue = syncQueue
        .catch(error =>
          reportError(error, { source: 'previous-reminder-sync' }),
        )
        .then(() => clearEventReminders())
        .catch(error => reportError(error, { source: 'disabled-reminders' }));
      return () => {
        cancelled = true;
      };
    }
    if (!events) {
      return undefined;
    }
    syncQueue = syncQueue
      .catch(error => reportError(error, { source: 'previous-reminder-sync' }))
      .then(async () => {
        if (cancelled || !(await ensureNotificationPermissions())) {
          return;
        }
        const now = Date.now();
        const planned: PlannedNotification[] = [];
        for (const event of events) {
          if (event.status !== 'confirmed' || !event.starts_at) {
            continue;
          }
          for (const hours of LEAD_HOURS) {
            const timestamp = dayjs(event.starts_at)
              .subtract(hours, 'hour')
              .valueOf();
            if (timestamp > now && timestamp < subscriptionEnd) {
              planned.push({
                id: 'booking-' + event.id + '-' + hours,
                timestamp,
                title: 'Eveniment în ' + hours + ' ore',
                body: event.hall_name ?? 'Rezervare apropiată',
                eventId: event.id,
              });
            }
          }
          if (
            financeEnabled &&
            role !== 'employee' &&
            event.ends_at &&
            Number(event.balance_due ?? 0) > 0
          ) {
            const timestamp = dayjs(event.ends_at).add(1, 'hour').valueOf();
            if (timestamp > now && timestamp < subscriptionEnd) {
              planned.push({
                id: 'booking-' + event.id + '-payment',
                timestamp,
                title: 'Verifică încasarea',
                body: event.hall_name ?? 'Rezervare',
                eventId: event.id,
              });
            }
          }
        }
        if (cancelled) {
          return;
        }
        const channel = await ensureChannel(
          'booking-reminders',
          'Reamintiri rezervări',
        );
        await syncTriggerNotifications(
          'booking-',
          channel,
          planned
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, MAXIMUM_SCHEDULED_REMINDERS),
        );
        if (cancelled) {
          await clearEventReminders();
        }
      })
      .catch(error => reportError(error, { source: 'booking-reminders' }));
    return () => {
      cancelled = true;
    };
  }, [enabled, events, role, subscriptionEnd, financeEnabled]);
  return null;
}
