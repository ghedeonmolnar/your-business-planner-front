import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { HallAddressField } from '@/features/halls/components/HallAddressField';
import {
  hallWizardStyles as styles,
  HALL_FIELD_COLUMNS_MAX_FONT_SCALE,
} from '@/features/halls/components/hallWizardStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormPanel } from '@/shared/components/FormPanel';
import { theme } from '@/shared/theme/theme';

export function HallBasicsFields({
  form,
  editing,
}: {
  form: UseFormReturn<HallFormValues>;
  editing: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const { control } = form;
  const columns = fontScale <= HALL_FIELD_COLUMNS_MAX_FONT_SCALE;
  return (
    <FormPanel title="Date principale">
      <Text style={styles.subtitle}>Informațiile esențiale despre sală.</Text>
      <ControlledTextField
        control={control}
        name="name"
        required
        label="Nume sală"
        placeholder="Numele sălii"
        leftIcon="business-outline"
      />
      <View style={columns ? styles.row : styles.stack}>
        <View style={columns ? styles.responsiveField : undefined}>
          <ControlledTextField
            control={control}
            name="capacity"
            required
            label="Capacitate maximă"
            placeholder="Ex.: 300"
            keyboardType="number-pad"
            leftIcon="people-outline"
          />
        </View>
        <View style={columns ? styles.responsiveField : undefined}>
          <ControlledTextField
            control={control}
            name="minimum_guests"
            required
            label="Capacitate minimă"
            placeholder="Ex.: 50"
            keyboardType="number-pad"
            leftIcon="people-outline"
          />
        </View>
      </View>
      <HallAddressField form={form} />
      <ControlledTextField
        control={control}
        name="description"
        label="Descriere (opțional)"
        placeholder="Ex.: Sală elegantă pentru nunți și evenimente corporate."
        multiline
      />
      <ControlledTextField
        control={control}
        name="area_sqm"
        label="Suprafață (m²) (opțional)"
        placeholder="Ex.: 520"
        keyboardType="decimal-pad"
        leftIcon="scan-outline"
      />
      {editing ? (
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
      ) : (
        <View style={styles.info}>
          <Ionicons
            name="information-circle-outline"
            size={theme.typography.sectionTitle}
            color={theme.colors.menu.primary}
          />
          <Text style={[styles.subtitle, styles.flex]}>
            Statusul se setează automat pe Activă la creare.
          </Text>
        </View>
      )}
    </FormPanel>
  );
}
