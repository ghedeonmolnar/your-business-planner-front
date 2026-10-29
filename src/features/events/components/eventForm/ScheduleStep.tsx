import React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { EventStatusSelect } from '@/features/events/components/EventStatusSelect';
import {
  eventFormStyles,
  SectionTitle,
} from '@/features/events/components/eventForm/EventFormSection';
import {
  EventFormControl,
  SelectOptionItem,
} from '@/features/events/components/eventForm/types';
import { LocalitySelectField } from '@/features/catalogs/components/LocalitySelectField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { useWatch } from 'react-hook-form';

type ScheduleStepProps = {
  control: EventFormControl;
  endTimeOptions: SelectOptionItem[];
  hourOptions: SelectOptionItem[];
  isEdit: boolean;
};

export function ScheduleStep({
  control,
  endTimeOptions,
  hourOptions,
  isEdit,
}: ScheduleStepProps) {
  const status = useWatch({ control, name: 'status' });
  const required = ['confirmed', 'completed'].includes(status);
  return (
    <View>
      <SectionTitle title="Rezervare și program" />
      <EventStatusSelect control={control} editing={isEdit} />
      <LocalitySelectField
        control={control}
        label="Locație"
        name="location"
        required={required}
      />
      <ControlledTextField
        control={control}
        label="Adresă completă"
        required={required}
        name="address"
        placeholder="Ex: Strada Independenței 1"
      />
      <View style={eventFormStyles.timeRow}>
        <View style={eventFormStyles.timeField}>
          <ControlledSelectField
            control={control}
            label="Ora start"
            required={required}
            name="start_time"
            options={hourOptions}
            placeholder="Alege ora"
            searchPlaceholder="Caută ora..."
            single
            singleEmptyValue=""
          />
        </View>
        <View style={eventFormStyles.timeField}>
          <ControlledSelectField
            control={control}
            label="Ora final"
            required={required}
            name="end_time"
            options={endTimeOptions}
            placeholder="Alege ora"
            searchPlaceholder="Caută ora..."
            single
            singleEmptyValue=""
          />
        </View>
      </View>
      <ControlledTextField
        control={control}
        keyboardType="numeric"
        required
        label="Preț pe oră"
        name="price_per_hour"
        numeric
        placeholder="Ex: 250"
      />
      <Text style={eventFormStyles.helperText}>
        Prețul propus este suma tarifelor mascotelor și rămâne editabil.
      </Text>
      <ControlledTextField
        control={control}
        keyboardType="numeric"
        label="Cost transport"
        name="transport_cost"
        numeric
        placeholder="Ex: 100"
      />
      <Text style={eventFormStyles.helperText}>
        Se adaugă o singură dată la prețul final, peste prețul pe oră.
      </Text>
    </View>
  );
}
