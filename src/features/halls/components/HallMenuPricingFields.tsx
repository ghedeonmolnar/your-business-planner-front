import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { MAX_HALL_MENU_RULES } from '@/features/halls/schemas/hallMenuPricingSchema';
import { HallMenuPriceFields } from '@/features/halls/components/HallMenuPriceFields';
import { HallMenuRuleEditor } from '@/features/halls/components/HallMenuRuleEditor';
import { hallWizardStyles as styles } from '@/features/halls/components/hallWizardStyles';
import { hallWeekdays } from '@/features/halls/utils/hallLabels';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { FormPanel } from '@/shared/components/FormPanel';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { formatExactMoney } from '@/shared/utils/money';
import { formatShortDate } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';

export function HallMenuPricingFields({
  form,
  onDraftChange,
}: {
  form: UseFormReturn<HallFormValues>;
  onDraftChange: (dirty: boolean) => void;
}) {
  const mode = useWatch({ control: form.control, name: 'menu_pricing_mode' });
  const rules = useWatch({ control: form.control, name: 'menu_price_rules' });
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: 'menu_price_rules',
  });
  const [editing, setEditing] = useState<number | 'new' | undefined>(() =>
    mode === 'advanced' && !rules.length ? 'new' : undefined,
  );
  const busy = useFormBusy();
  const [draftDirty, setDraftDirty] = useState(false);
  useEffect(() => onDraftChange(draftDirty), [draftDirty, onDraftChange]);
  const advanced = mode === 'advanced';
  const error = form.formState.errors.menu_price_rules;
  const changeMode = (index: number) => {
    const apply = () => {
      form.setValue('menu_pricing_mode', index ? 'advanced' : 'simple', {
        shouldDirty: true,
      });
      if (!index) remove();
      setEditing(index && !rules.length ? 'new' : undefined);
      form.clearErrors('menu_price_rules');
    };
    if (!index && (rules.length || draftDirty))
      confirmAction({
        title: 'Treci la preț unic?',
        message:
          'Regulile pe perioade vor fi eliminate la salvarea sălii. Prețurile de bază rămân.',
        confirmLabel: 'Alege Simplu',
        destructive: true,
        onConfirm: apply,
      });
    else apply();
  };
  return (
    <FormPanel title="Configurare prețuri meniu">
      <Text style={styles.subtitle}>
        Stabilește prețurile pentru meniuri. Poți completa și mai târziu.
      </Text>
      <AppSegmentedControl
        segments={[{ label: 'Simplu' }, { label: 'Avansat' }]}
        selectedIndex={advanced ? 1 : 0}
        onChangeIndex={changeMode}
        containerStyle={styles.segment}
        segmentStyle={styles.segmentItem}
        activeBackgroundColor={theme.colors.menu.primarySoft}
        activeColor={theme.colors.menu.primary}
        inactiveColor={theme.colors.menu.text}
      />
      <View style={styles.info}>
        <Ionicons
          name={advanced ? 'layers-outline' : 'flash-outline'}
          size={theme.typography.title}
          color={theme.colors.menu.primary}
        />
        <View style={styles.flex}>
          <Text style={styles.infoTitle}>
            {advanced ? 'Avansat' : 'Simplu'}
          </Text>
          <Text style={styles.subtitle}>
            {advanced
              ? 'Prețuri pe perioade și zile, separat pentru adulți și copii.'
              : 'Un singur preț pentru fiecare meniu, valabil oricând.'}
          </Text>
        </View>
      </View>
      {advanced ? (
        <Text style={styles.body}>Prețuri de bază (opțional)</Text>
      ) : null}
      <HallMenuPriceFields
        control={form.control}
        adultName="menu_price"
        childName="child_menu_price"
      />
      {advanced ? (
        <Text style={styles.subtitle}>
          În afara regulilor se folosesc prețurile de bază. Fără preț de bază,
          meniul rămâne nespecificat.
        </Text>
      ) : (
        <AppButton
          label="Avansat · Prețuri pe perioade și zile"
          icon="layers-outline"
          variant="outline"
          multiline
          onPress={() => changeMode(1)}
        />
      )}
      {advanced && editing !== undefined ? (
        <HallMenuRuleEditor
          key={editing}
          rule={editing === 'new' ? undefined : rules[editing]}
          others={rules.filter((_, index) => index !== editing)}
          onDraftChange={setDraftDirty}
          onClose={() => setEditing(undefined)}
          onSave={rule => {
            if (editing === 'new') append(rule);
            else update(editing, rule);
            setEditing(undefined);
            form.clearErrors('menu_price_rules');
          }}
        />
      ) : null}
      {advanced ? (
        <View style={styles.stack}>
          <Text style={styles.body}>Reguli adăugate ({fields.length})</Text>
          {fields.map((field, index) => (
            <View key={field.id} style={styles.rule}>
              <View style={styles.ruleHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={theme.typography.title}
                  color={theme.colors.menu.primary}
                />
                <Text style={[styles.infoTitle, styles.flex]}>
                  {field.name}
                </Text>
                <IconButton
                  icon="create-outline"
                  accessibilityLabel={`Editează regula ${field.name}`}
                  disabled={busy || editing !== undefined}
                  onPress={() => setEditing(index)}
                />
                <IconButton
                  icon="trash-outline"
                  accessibilityLabel={`Elimină regula ${field.name}`}
                  disabled={busy || editing !== undefined}
                  onPress={() => remove(index)}
                />
              </View>
              <Text style={styles.subtitle}>
                {formatShortDate(field.starts_on)} –{' '}
                {formatShortDate(field.ends_on)}
              </Text>
              <Text style={styles.subtitle}>
                {field.weekdays.map(day => hallWeekdays[day]).join(', ')}
              </Text>
              <Text style={styles.body}>
                Adulți: {formatExactMoney(field.menu_price)} · Copii:{' '}
                {formatExactMoney(field.child_menu_price)}
              </Text>
              {error?.[index]?.starts_on?.message ? (
                <Text style={styles.error}>
                  {error[index]?.starts_on?.message}
                </Text>
              ) : null}
            </View>
          ))}
          {error?.root?.message || error?.message ? (
            <Text style={styles.error}>
              {error.root?.message ?? error.message}
            </Text>
          ) : null}
          {editing === undefined ? (
            <AppButton
              label="Adaugă regulă"
              icon="add"
              variant="outline"
              disabled={busy || fields.length >= MAX_HALL_MENU_RULES}
              onPress={() => setEditing('new')}
            />
          ) : null}
          <Text style={styles.subtitle}>
            Fiecare dată are un singur preț. Regulile nu se pot suprapune în
            aceleași zile.
          </Text>
        </View>
      ) : null}
    </FormPanel>
  );
}
