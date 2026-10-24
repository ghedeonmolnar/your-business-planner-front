import React from 'react';
import { CollapsibleSectionHeader } from '@/shared/components/CollapsibleSectionHeader';

type AgendaMonthHeaderProps = {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
};

export function AgendaMonthHeader({
  title,
  count,
  expanded,
  onToggle,
}: AgendaMonthHeaderProps) {
  return (
    <CollapsibleSectionHeader
      title={title}
      countLabel={`${count} ${count === 1 ? 'eveniment' : 'evenimente'}`}
      icon="calendar-outline"
      expanded={expanded}
      onToggle={onToggle}
    />
  );
}
