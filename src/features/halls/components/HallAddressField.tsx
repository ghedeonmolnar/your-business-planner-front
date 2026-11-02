import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { useHallAddressSuggestions } from '@/features/halls/hooks/useHallAddressSuggestions';
import { hallWizardStyles as styles } from '@/features/halls/components/hallWizardStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { showError } from '@/shared/feedback/showError';
import { theme } from '@/shared/theme/theme';

export function HallAddressField({
  form,
}: {
  form: UseFormReturn<HallFormValues>;
}) {
  const value = useWatch({ control: form.control, name: 'address' });
  const [searching, setSearching] = useState(false);
  const busy = useFormBusy();
  const query = useHallAddressSuggestions(value, searching && !busy);
  const reported = useRef(false);
  useEffect(() => {
    if (query.ready && query.error && !reported.current) {
      reported.current = true;
      showError(
        query.error,
        'Sugestiile de adresă nu sunt disponibile. Poți completa adresa manual.',
      );
    }
  }, [query.error, query.ready]);
  return (
    <View style={styles.stack}>
      <ControlledTextField
        control={form.control}
        name="address"
        label="Adresă"
        required
        placeholder="Caută strada, localitatea sau sala"
        leftIcon="location-outline"
        onValueChange={() => setSearching(true)}
        rightIcon={value ? 'close' : undefined}
        rightIconAccessibilityLabel="Șterge adresa"
        onRightIconPress={() => {
          form.setValue('address', '', {
            shouldDirty: true,
            shouldValidate: true,
          });
          setSearching(false);
        }}
      />
      {query.ready && query.isFetching ? (
        <Text style={styles.subtitle}>Se caută adrese…</Text>
      ) : null}
      {query.ready && query.data && !query.error ? (
        <View style={styles.suggestions}>
          {query.data.suggestions.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Alege adresa ${item.label}`}
              disabled={busy}
              style={styles.suggestion}
              onPress={() => {
                form.setValue('address', item.label, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setSearching(false);
              }}
            >
              <Ionicons
                name="location-outline"
                size={theme.typography.sectionTitle}
                color={theme.colors.menu.primary}
              />
              <Text style={[styles.body, styles.flex]}>{item.label}</Text>
            </Pressable>
          ))}
          {query.data.suggestions.length ? (
            <Text style={styles.attribution} numberOfLines={1}>
              Google Maps
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Nu am găsit adrese. Poți completa adresa manual.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
