import React from 'react';
import { CollapsibleSectionHeader } from '@/shared/components/CollapsibleSectionHeader';
import { bookingCountLabel } from '@/features/bookings/utils/bookingSections';

export function BookingMonthHeader({
  title,
  total,
  collapsed,
  onToggle,
}: {
  title: string;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <CollapsibleSectionHeader
      title={title}
      countLabel={bookingCountLabel(total)}
      icon="calendar-outline"
      expanded={!collapsed}
      onToggle={onToggle}
    />
  );
}
