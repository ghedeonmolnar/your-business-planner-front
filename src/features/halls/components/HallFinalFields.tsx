import React from 'react';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { HallAmenitiesFields } from '@/features/halls/components/HallAmenitiesFields';
import { HallPhotosField } from '@/features/halls/components/HallPhotosField';
import { HallHoursFields } from '@/features/halls/components/HallHoursFields';
import { HallPhotoDraft } from '@/features/halls/types';
import { hallWizardStyles as styles } from '@/features/halls/components/hallWizardStyles';
import { FormPanel } from '@/shared/components/FormPanel';
import { ControlledTextField } from '@/shared/components/ControlledTextField';

export function HallFinalFields({
  form,
  photos,
  onPhotosChange,
  picking,
  onPicking,
  editing,
}: {
  form: UseFormReturn<HallFormValues>;
  photos: HallPhotoDraft[];
  onPhotosChange: (photos: HallPhotoDraft[]) => void;
  picking: boolean;
  onPicking: (value: boolean) => void;
  editing: boolean;
}) {
  return (
    <>
      <Text style={styles.title}>Media și detalii finale</Text>
      <Text style={styles.subtitle}>
        Adaugă facilități, imagini și note interne.
      </Text>
      <HallAmenitiesFields form={form} />
      <HallPhotosField
        photos={photos}
        onChange={onPhotosChange}
        picking={picking}
        onPicking={onPicking}
      />
      {editing ? (
        <>
          <FormPanel title="Aranjament">
            <ControlledTextField
              control={form.control}
              name="arrangement"
              label="Aranjament"
              placeholder="De exemplu: mese rotunde"
            />
          </FormPanel>
          <HallHoursFields control={form.control} />
        </>
      ) : null}
      <FormPanel title="Note interne">
        <ControlledTextField
          control={form.control}
          name="internal_notes"
          label="Note interne (opțional)"
          placeholder="Detalii interne pentru echipă"
          multiline
        />
        <Text style={styles.subtitle}>
          Nu sunt vizibile clienților și nu se includ în mesajele trimise lor.
        </Text>
      </FormPanel>
    </>
  );
}
