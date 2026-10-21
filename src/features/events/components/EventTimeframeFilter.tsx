import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EventTimeframe } from '@/features/events/types';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { theme } from '@/shared/theme/theme';

type EventTimeframeFilterProps = {
  value: EventTimeframe;
  onChange: (timeframe: EventTimeframe) => void;
};

export const eventTimeframeLabels: Record<EventTimeframe, string> = {
  upcoming: 'Evenimente următoare',
  past: 'Evenimente trecute',
  all: 'Toate evenimentele',
};

export const eventTimeframeCountLabels: Record<EventTimeframe, string> = {
  upcoming: 'evenimente următoare',
  past: 'evenimente trecute',
  all: 'evenimente salvate',
};

const options = (Object.keys(eventTimeframeLabels) as EventTimeframe[]).map(
  timeframe => ({
    id: timeframe,
    name: eventTimeframeLabels[timeframe],
  }),
);

export function EventTimeframeFilter({
  value,
  onChange,
}: EventTimeframeFilterProps) {
  return (
    <View style={styles.field}>
      <SearchableSelect<EventTimeframe>
        allowClear={false}
        label="Afișează"
        noItemsText="Nu există opțiuni"
        onChange={selectedValues => onChange(selectedValues[0] ?? 'upcoming')}
        options={options}
        placeholder="Alege ce afișăm"
        searchPlaceholder="Caută"
        selectedValues={[value]}
        single
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: theme.spacing.md,
  },
});
