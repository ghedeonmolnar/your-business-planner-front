import React from 'react';
import { Control } from 'react-hook-form';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormPanel } from '@/shared/components/FormPanel';

export function HallBasicsFields({
  control,
}: {
  control: Control<HallFormValues>;
}) {
  return (
    <FormPanel title="Informații generale">
      <ControlledTextField
        control={control}
        name="name"
        required
        label="Nume sală *"
        placeholder="Numele sălii"
      />
      <ControlledTextField
        control={control}
        name="capacity"
        required
        label="Capacitate maximă (persoane) *"
        placeholder="Capacitatea sălii"
        keyboardType="number-pad"
        leftIcon="people-outline"
      />
      <ControlledTextField
        control={control}
        name="minimum_guests"
        label="Minim comercial implicit (persoane)"
        placeholder="Nespecificat"
        keyboardType="number-pad"
      />
      <ControlledTextField
        control={control}
        name="address"
        label="Adresă"
        placeholder="Adresa spațiului"
      />
      <ControlledTextField
        control={control}
        name="menu_price"
        label="Preț meniu adulți (lei)"
        numeric
        placeholder="Nespecificat"
        keyboardType="decimal-pad"
      />
      <ControlledTextField
        control={control}
        name="child_menu_price"
        label="Preț meniu copii (lei)"
        numeric
        placeholder="Nespecificat"
        keyboardType="decimal-pad"
      />
      <ControlledTextField
        control={control}
        name="description"
        label="Descriere"
        placeholder="Descrie spațiul și evenimentele potrivite"
        multiline
      />
      <ControlledTextField
        control={control}
        name="area_sqm"
        label="Suprafață (m²)"
        placeholder="Nespecificată"
        keyboardType="decimal-pad"
      />
      <ControlledTextField
        control={control}
        name="arrangement"
        label="Aranjament"
        placeholder="De exemplu: mese rotunde"
      />
      <ControlledSelectField
        control={control}
        name="is_active"
        required
        label="Status"
        options={[
          { id: 'yes', name: 'Activă' },
          { id: 'no', name: 'Inactivă' },
        ]}
        placeholder="Selectează statusul"
        searchPlaceholder="Caută status"
        single
      />
    </FormPanel>
  );
}
