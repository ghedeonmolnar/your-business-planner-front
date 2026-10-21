import React from 'react';
import { Text } from 'react-native-paper';
import { ClientContactsSection } from '@/features/clients/components/ClientContactsSection';
import { ClientLocationsSection } from '@/features/clients/components/ClientLocationsSection';
import { ClientProfileSummary } from '@/features/clients/components/ClientProfileSummary';
import { Client } from '@/features/clients/types';
import { EventTimeframeFilter } from '@/features/events/components/EventTimeframeFilter';
import { EventTimeframe } from '@/features/events/types';
import { clientDetailsScreenStyles as styles } from '@/features/clients/screens/clientDetailsScreenStyles';

type Props = {
  client: Client;
  sourceLabel: string;
  eventsCount?: number;
  timeframe: EventTimeframe;
  onTimeframeChange: (timeframe: EventTimeframe) => void;
};

export function ClientDetailsHeader({
  client,
  sourceLabel,
  eventsCount,
  timeframe,
  onTimeframeChange,
}: Props) {
  return (
    <>
      <ClientProfileSummary client={client} sourceLabel={sourceLabel} />
      <ClientContactsSection client={client} />
      <ClientLocationsSection client={client} />
      <Text accessibilityRole="header" style={styles.eventsTitle}>
        Evenimente{eventsCount === undefined ? '' : ` (${eventsCount})`}
      </Text>
      <EventTimeframeFilter onChange={onTimeframeChange} value={timeframe} />
    </>
  );
}
