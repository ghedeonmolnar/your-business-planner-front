import React from 'react';
import { CustomerListItem } from '@/features/company/types';
import { RecordCard } from '@/shared/components/RecordCard';
import { MetaPill } from '@/shared/components/MetaPill';

export function CustomerCard({
  customer,
  onOpen,
}: {
  customer: CustomerListItem;
  onOpen: () => void;
}) {
  const countLabel = `${customer.bookings_count} ${customer.bookings_count === 1 ? 'rezervare' : 'rezervări'}`;
  return (
    <RecordCard
      title={customer.name}
      subtitle={customer.phone || 'Telefon necompletat'}
      onPress={onOpen}
      accessibilityLabel={`Vezi rezervările pentru ${customer.name}`}
      accessibilityHint={`${customer.phone || 'Telefon necompletat'}. ${countLabel}.`}
      badge={
        <MetaPill icon="calendar-outline" label={countLabel} tone="primary" />
      }
    />
  );
}
