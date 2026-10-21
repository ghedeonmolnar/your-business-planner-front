import React from 'react';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { EventMapFields } from '@/shared/types/mapLocation';
import { openEventMap } from '@/shared/utils/eventMapLinks';

export function EventMapButton({
  event,
  compact = false,
}: {
  event: EventMapFields;
  compact?: boolean;
}) {
  if (!event.map_location?.confirmed) return null;

  return compact ? (
    <IconButton
      accessibilityLabel="Deschide Google Maps"
      icon="map-outline"
      onPress={() => openEventMap(event)}
    />
  ) : (
    <AppButton
      icon="map-outline"
      label="Deschide Google Maps"
      multiline
      onPress={() => openEventMap(event)}
      variant="outline"
    />
  );
}
