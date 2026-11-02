import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  HallFormValues,
  MAX_HALL_AMENITIES,
} from '@/features/halls/schemas/hallFormSchema';
import { hallAmenityOptions } from '@/features/halls/utils/hallLabels';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { showMessage } from '@/shared/feedback/showMessage';
import { theme } from '@/shared/theme/theme';

const amenitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Completează numele facilității.')
    .max(100, 'Folosește cel mult 100 de caractere.'),
});

export function HallAmenitiesFields({
  form,
}: {
  form: UseFormReturn<HallFormValues>;
}) {
  const custom = useAppForm({
    resolver: zodResolver(amenitySchema),
    defaultValues: { name: '' },
  });
  const busy = useFormBusy();
  const [adding, setAdding] = useState(false);
  const add = custom.handleSubmit(({ name }) => {
    const current = form.getValues('amenities');
    if (
      current.some(
        value => value.toLocaleLowerCase('ro') === name.toLocaleLowerCase('ro'),
      )
    ) {
      showMessage('Facilitate existentă', 'Facilitatea este deja selectată.');
      return;
    }
    if (current.length >= MAX_HALL_AMENITIES) {
      showMessage('Limită atinsă', 'Poți selecta cel mult 50 de facilități.');
      return;
    }
    form.setValue('amenities', [...current, name], {
      shouldDirty: true,
      shouldValidate: true,
    });
    custom.reset();
    setAdding(false);
  });
  return (
    <FormPanel title="Facilități">
      <Controller
        control={form.control}
        name="amenities"
        render={({ field, fieldState }) => {
          const options = [
            ...new Set([
              ...hallAmenityOptions.map(item => item.name),
              ...field.value,
            ]),
          ];
          return (
            <View style={styles.stack}>
              <View style={styles.row}>
                {options.map(label => {
                  const selected = field.value.includes(label);
                  return (
                    <Pressable
                      key={label}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected, disabled: busy }}
                      accessibilityLabel={label}
                      disabled={busy}
                      style={[styles.chip, selected && styles.selectedChip]}
                      onPress={() => {
                        if (
                          !selected &&
                          field.value.length >= MAX_HALL_AMENITIES
                        )
                          return showMessage(
                            'Limită atinsă',
                            'Poți selecta cel mult 50 de facilități.',
                          );
                        field.onChange(
                          selected
                            ? field.value.filter(value => value !== label)
                            : [...field.value, label],
                        );
                      }}
                    >
                      <Ionicons
                        name={selected ? 'checkmark' : 'ellipse-outline'}
                        size={theme.typography.bodyLarge}
                        color={
                          selected
                            ? theme.colors.menu.primary
                            : theme.colors.menu.muted
                        }
                      />
                      <Text style={selected ? styles.link : styles.body}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {fieldState.error ? (
                <Text style={styles.danger}>{fieldState.error.message}</Text>
              ) : null}
            </View>
          );
        }}
      />
      {adding ? (
        <ControlledTextField
          control={custom.control}
          name="name"
          required
          label="Facilitate personalizată"
          placeholder="Numele facilității"
        />
      ) : null}
      <AppButton
        label={adding ? 'Adaugă facilitate' : 'Adaugă facilitate personalizată'}
        icon="add"
        variant="outline"
        disabled={busy}
        onPress={adding ? add : () => setAdding(true)}
      />
    </FormPanel>
  );
}
