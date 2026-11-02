import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  hallMenuRuleSchema,
  HallMenuRuleValues,
} from '@/features/halls/schemas/hallMenuPricingSchema';
import { hallMenuRulesOverlap } from '@/features/halls/utils/hallMenuPricing';
import { hallWeekdays } from '@/features/halls/utils/hallLabels';
import { HallMenuPriceFields } from '@/features/halls/components/HallMenuPriceFields';
import { hallWizardStyles as styles } from '@/features/halls/components/hallWizardStyles';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';

export function HallMenuRuleEditor({
  rule,
  others,
  onSave,
  onClose,
  onDraftChange,
}: {
  rule?: HallMenuRuleValues;
  others: HallMenuRuleValues[];
  onSave: (rule: HallMenuRuleValues) => void;
  onClose: () => void;
  onDraftChange: (dirty: boolean) => void;
}) {
  const form = useAppForm<HallMenuRuleValues>({
    resolver: zodResolver(hallMenuRuleSchema),
    defaultValues: rule ?? {
      name: '',
      starts_on: '',
      ends_on: '',
      weekdays: [],
      menu_price: '',
      child_menu_price: '',
    },
  });
  const weekdays = useWatch({ control: form.control, name: 'weekdays' });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    onDraftChange(dirty);
    return () => onDraftChange(false);
  }, [dirty, onDraftChange]);
  const save = form.handleSubmit(values => {
    if (others.some(item => hallMenuRulesOverlap(item, values))) {
      form.setError('starts_on', {
        message:
          'Perioada și zilele se suprapun cu o altă regulă. Alege alte zile sau alt interval.',
      });
      return;
    }
    onSave(values);
  });
  return (
    <View style={styles.rule}>
      <Text style={styles.infoTitle}>
        {rule ? 'Editează regula' : 'Regulă nouă'}
      </Text>
      <Text style={styles.subtitle}>
        Alege perioada, inclusiv anul, și zilele în care se aplică aceste
        prețuri.
      </Text>
      <ControlledTextField
        control={form.control}
        name="name"
        label="Nume regulă"
        required
        placeholder="Ex.: Weekend, sezon 2027"
      />
      <ControlledDateField
        control={form.control}
        name="starts_on"
        label="De la"
        required
        placeholder="Începutul perioadei"
        displayFormat="numeric"
      />
      <ControlledDateField
        control={form.control}
        name="ends_on"
        label="Până la (inclusiv)"
        required
        placeholder="Sfârșitul perioadei"
        displayFormat="numeric"
      />
      <ControlledSelectField
        control={form.control}
        name="weekdays"
        label="Zilele săptămânii"
        required
        options={hallWeekdays.map((name, id) => ({ id, name }))}
        placeholder="Selectează zilele"
        searchPlaceholder="Caută ziua"
      />
      <View style={styles.chips}>
        <AppButton
          label="Toate zilele"
          variant="ghost"
          onPress={() =>
            form.setValue('weekdays', [0, 1, 2, 3, 4, 5, 6], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <AppButton
          label="Sâm. și dum."
          variant="ghost"
          onPress={() =>
            form.setValue('weekdays', [5, 6], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </View>
      <Text style={styles.subtitle}>
        {weekdays.length} zile selectate · prețuri per persoană
      </Text>
      <HallMenuPriceFields
        control={form.control}
        adultName="menu_price"
        childName="child_menu_price"
        required
        inline
      />
      <AppButton
        label={rule ? 'Salvează regula' : 'Adaugă regula'}
        icon="add"
        variant="outline"
        onPress={save}
        fullWidth
      />
      <AppButton
        label="Renunță la regulă"
        variant="ghost"
        onPress={() => {
          if (!dirty) onClose();
          else
            confirmAction({
              title: 'Renunți la regulă?',
              message:
                'Modificările acestei reguli nu vor fi adăugate în lista de prețuri.',
              confirmLabel: 'Renunță',
              destructive: true,
              onConfirm: onClose,
            });
        }}
      />
    </View>
  );
}
