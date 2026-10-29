import React, { useState } from 'react';
import { Keyboard, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Control, Controller } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { BookingTimePicker } from '@/features/bookings/components/BookingTimePicker';
import { bookingTimePickerStyles as styles } from '@/features/bookings/components/bookingTimePickerStyles';
import { FormInput, formInputStyles } from '@/shared/components/FormInput';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { theme } from '@/shared/theme/theme';

export function ControlledBookingTimeField({
  control,
  name,
  label,
  date,
  start = '',
  disabled = false,
  onSelectionChange,
}: {
  control: Control<BookingFormValues>;
  name: 'starts_at' | 'ends_at';
  label: string;
  date: string;
  start?: string;
  disabled?: boolean;
  onSelectionChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const blocked = useFormBusy() || disabled;
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        const close = () => {
          setOpen(false);
          onBlur();
        };
        const change = (next: string) => {
          onChange(next);
          onSelectionChange?.(next);
        };
        const display = value.split(' ').slice(1).join(' ');
        return (
          <FormInput label={label} error={error?.message}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityValue={{ text: display || 'Ora necompletată' }}
              accessibilityState={{ disabled: blocked }}
              disabled={blocked}
              onPress={() => {
                Keyboard.dismiss();
                setOpen(true);
              }}
              style={[
                formInputStyles.field,
                formInputStyles.fieldDimensions,
                styles.field,
                blocked ? formInputStyles.fieldDisabled : undefined,
                error ? formInputStyles.fieldError : undefined,
              ]}
            >
              <Text
                style={[
                  styles.fieldText,
                  !display ? styles.placeholder : undefined,
                ]}
              >
                {display || 'Alege ora și minutul'}
              </Text>
              <Ionicons
                name="time-outline"
                color={theme.colors.primary}
                size={20}
              />
            </Pressable>
            {open && !blocked ? (
              <BookingTimePicker
                date={date}
                start={start}
                end={name === 'ends_at'}
                value={value}
                label={label}
                onChange={change}
                onClose={close}
              />
            ) : null}
          </FormInput>
        );
      }}
    />
  );
}
