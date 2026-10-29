import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Control, useWatch } from 'react-hook-form';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { hallWeekdays } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { FormPanel } from '@/shared/components/FormPanel';

function HallDayFields({
  control,
  index,
}: {
  control: Control<HallFormValues>;
  index: number;
}) {
  const enabled = useWatch({
    control,
    name: `business_hours.${index}.enabled`,
  });
  const day = hallWeekdays[index];
  return (
    <View style={[styles.stack, styles.divider]}>
      <ControlledSwitchField
        control={control}
        name={`business_hours.${index}.enabled`}
        label={day}
        activeText="Program configurat"
        inactiveText="Nespecificat"
      />
      {enabled ? (
        <>
          <ControlledTextField
            control={control}
            name={`business_hours.${index}.start_time`}
            required
            label={`${day}: început`}
            placeholder="HH:mm"
            keyboardType="numbers-and-punctuation"
          />
          <ControlledTextField
            control={control}
            name={`business_hours.${index}.end_time`}
            required
            label={`${day}: sfârșit`}
            placeholder="HH:mm"
            keyboardType="numbers-and-punctuation"
          />
          <ControlledSwitchField
            control={control}
            name={`business_hours.${index}.ends_next_day`}
            label={`${day}: sfârșit în ziua următoare`}
            activeText="Ziua următoare"
            inactiveText="Aceeași zi"
          />
        </>
      ) : null}
    </View>
  );
}

export function HallHoursFields({
  control,
}: {
  control: Control<HallFormValues>;
}) {
  return (
    <FormPanel title="Program standard și organizare">
      <Text style={styles.subtitle}>
        Program orientativ. Disponibilitatea se verifică în calendar, pe baza
        rezervărilor existente.
      </Text>
      {hallWeekdays.map((day, index) => (
        <HallDayFields key={day} control={control} index={index} />
      ))}
      <ControlledTextField
        control={control}
        name="setup_minutes"
        label="Timp de pregătire (minute)"
        placeholder="Nespecificat"
        keyboardType="number-pad"
      />
      <ControlledTextField
        control={control}
        name="cleanup_minutes"
        label="Timp de eliberare (minute)"
        placeholder="Nespecificat"
        keyboardType="number-pad"
      />
      <Text style={styles.subtitle}>
        Timpii sunt repere de organizare și nu blochează automat calendarul.
      </Text>
    </FormPanel>
  );
}
