import React from 'react';
import {
  eventTimeframeCountLabels,
  EventTimeframeFilter,
} from '@/features/events/components/EventTimeframeFilter';
import { EventTimeframe } from '@/features/events/types';
import { isUnauthorizedError } from '@/shared/api/client';
import { AppButton } from '@/shared/components/AppButton';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { eventsScreenStyles as styles } from '@/features/events/screens/eventsScreenStyles';

export type EventsViewMode = 'list' | 'calendar';

type EventsScreenHeaderProps = {
  error: unknown;
  eventsCount: number;
  onAdd: () => void;
  onChangeTimeframe: (timeframe: EventTimeframe) => void;
  onChangeViewMode: (mode: EventsViewMode) => void;
  onRetry: () => void;
  timeframe: EventTimeframe;
  viewMode: EventsViewMode;
};

export function EventsScreenHeader({
  error,
  eventsCount,
  onAdd,
  onChangeTimeframe,
  onChangeViewMode,
  onRetry,
  timeframe,
  viewMode,
}: EventsScreenHeaderProps) {
  return (
    <>
      <ScreenHeader
        action={
          <AppButton
            accessibilityLabel="Adaugă eveniment"
            icon="add"
            label="Eveniment"
            onPress={onAdd}
            size="small"
            variant="outline"
          />
        }
        eyebrow="Planificare"
        subtitle={`${eventsCount} ${eventTimeframeCountLabels[timeframe]}`}
        title="Evenimente"
      />
      <AppSegmentedControl
        containerStyle={styles.segmentedControl}
        onChangeIndex={index =>
          onChangeViewMode(index === 0 ? 'calendar' : 'list')
        }
        selectedIndex={viewMode === 'calendar' ? 0 : 1}
        segments={[{ label: 'Calendar' }, { label: 'Listă' }]}
      />
      {viewMode === 'list' ? (
        <EventTimeframeFilter
          onChange={onChangeTimeframe}
          value={timeframe}
        />
      ) : null}
      {error && !isUnauthorizedError(error) && viewMode === 'list' ? (
        <ErrorBanner
          message={getErrorMessage(
            error,
            'Nu am putut încărca evenimentele.',
          )}
          onRetry={onRetry}
        />
      ) : null}
    </>
  );
}
