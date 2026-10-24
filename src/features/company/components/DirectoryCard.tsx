import React from 'react';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { RecordCard } from '@/shared/components/RecordCard';
import { InfoRow } from '@/shared/components/InfoRow';
import { IconButton } from '@/shared/components/IconButton';
import { AppButton } from '@/shared/components/AppButton';
import { MetaPill } from '@/shared/components/MetaPill';

export function DirectoryCard({
  item,
  kind,
  onEdit,
  onHistory,
}: {
  item: DirectoryItem;
  kind: DirectoryKind;
  onEdit: () => void;
  onHistory: () => void;
}) {
  return (
    <RecordCard
      title={item.name}
      badge={
        <IconButton
          icon="create-outline"
          accessibilityLabel={'Editează ' + item.name}
          onPress={onEdit}
        />
      }
      actions={
        kind === 'clients' ? (
          <AppButton
            label="Vezi rezervările"
            icon="time-outline"
            variant="ghost"
            onPress={onHistory}
          />
        ) : undefined
      }
    >
      {kind === 'clients' ? (
        <>
          <InfoRow
            icon="call-outline"
            value={item.phone || 'Telefon necompletat'}
          />
          {item.notes ? <InfoRow value={item.notes} /> : null}
        </>
      ) : (
        <>
          {kind === 'halls' ? (
            <InfoRow
              icon="business-outline"
              value={`${item.capacity ?? 0} persoane${item.address ? ' · ' + item.address : ''}`}
            />
          ) : (
            <InfoRow
              icon="person-outline"
              value={
                staffRoleOptions.find(role => role.id === item.job_role)
                  ?.name ?? 'Personal'
              }
            />
          )}
          <MetaPill
            label={item.is_active === false ? 'Inactivă' : 'Activă'}
            tone={item.is_active === false ? 'neutral' : 'success'}
          />
        </>
      )}
    </RecordCard>
  );
}
