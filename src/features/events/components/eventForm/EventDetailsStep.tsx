import React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { EventTypeSelect } from '@/features/events/components/EventTypeSelect';
import {
  eventFormStyles,
  SectionTitle,
} from '@/features/events/components/eventForm/EventFormSection';
import {
  EventFormControl,
  SelectOptionItem,
} from '@/features/events/components/eventForm/types';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { useWatch } from 'react-hook-form';

type EventDetailsStepProps = {
  catalogsLoading: boolean;
  channelOptions: SelectOptionItem[];
  control: EventFormControl;
  maximumEventDate: Date;
  minimumEventDate: Date;
  mascotsLoading: boolean;
  mascotOptions: SelectOptionItem[];
  showLegacyContactHint: boolean;
};

export function EventDetailsStep({
  catalogsLoading,
  channelOptions,
  control,
  maximumEventDate,
  minimumEventDate,
  mascotsLoading,
  mascotOptions,
  showLegacyContactHint,
}: EventDetailsStepProps) {
  const legacyContact = useWatch({ control, name: 'legacy_contact_allowed' });
  const phone = useWatch({ control, name: 'contact_phone' });
  return (
    <View>
      <SectionTitle title="Detalii despre eveniment" />
      {showLegacyContactHint ? (
        <Text style={eventFormStyles.helperText}>
          Acest eveniment vechi poate rămâne fără telefon. Dacă adaugi unul,
          clientul va fi asociat automat.
        </Text>
      ) : null}
      <ControlledSelectField
        control={control}
        disabled={catalogsLoading && !channelOptions.length}
        label="Comunicăm pe"
        required={!legacyContact || Boolean(phone)}
        name="communication_channel"
        options={channelOptions}
        placeholder="Alege canalul"
        searchPlaceholder="Caută canal..."
        single
        singleEmptyValue=""
      />
      <ControlledTextField
        control={control}
        keyboardType="phone-pad"
        label="Telefon de contact"
        required={!legacyContact}
        name="contact_phone"
        placeholder="Ex: 0732 652 339"
      />
      <ControlledDateField
        control={control}
        required
        label="Data eveniment"
        maximumDate={maximumEventDate}
        minimumDate={minimumEventDate}
        name="date"
        placeholder="zz/ll/aaaa"
      />
      <ControlledSelectField
        control={control}
        disabled={mascotsLoading && !mascotOptions.length}
        required
        label="Mascote dorite"
        name="mascot_ids"
        noItemsText="Nu există mascote disponibile"
        options={mascotOptions}
        placeholder={mascotsLoading ? 'Se încarcă...' : 'Selectează mascote'}
        searchPlaceholder="Caută mascotă..."
      />
      <EventTypeSelect control={control} />
    </View>
  );
}
