import React from 'react';
import { Text } from 'react-native-paper';
import { useReminderPermissions } from '@/features/events/hooks/useReminderPermissions';
import { useReminderStatus } from '@/features/events/notifications/reminderStatus';
import { MAXIMUM_SCHEDULED_REMINDERS } from '@/features/events/notifications/reminderWindow';

export function ReminderStatusPanel() {
  const { summary, error } = useReminderPermissions();
  const status = useReminderStatus();
  return (
    <>
      <Text accessibilityLiveRegion="polite">
        {error
          ? 'Starea notificărilor nu este disponibilă.'
          : !summary
            ? 'Se verifică notificările…'
            : `Notificări: ${summary.notifications ? 'permise' : 'oprite'}. Alarme exacte: ${summary.alarms ? 'permise' : 'oprite'}. Reamintiri programate: ${summary.scheduled}.`}
      </Text>
      <Text>
        Păstrăm cel mult {MAXIMUM_SCHEDULED_REMINDERS} de reamintiri apropiate.
        Celelalte intră în această fereastră la sincronizarea următoare.
      </Text>
      {status ? (
        <Text accessibilityLiveRegion="polite">
          Reamintiri amânate: {status.deferred}. Programări nereușite:{' '}
          {status.failed}.
        </Text>
      ) : (
        <Text>
          Numărul reamintirilor amânate va fi disponibil după sincronizare.
        </Text>
      )}
      <Text>
        Reamintirile se actualizează când aplicația este deschisă. Revino în
        aplicație pentru a prelua anulările și modificările făcute de colegi.
      </Text>
    </>
  );
}
