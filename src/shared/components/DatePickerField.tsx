import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import {
  DateCalendarAvailability,
  DateCalendarPanel,
} from '@/shared/components/DateCalendarPanel';
import { FormInput, formInputStyles } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { dateToIsoDate, isValidIsoDate } from '@/shared/utils/dateInput';
import { formatLongDate, formatShortDate } from '@/shared/utils/formatDate';

export type DatePickerFieldProps = {
  error?: string;
  label: string;
  required?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value?: string | null;
  displayFormat?: 'long' | 'numeric';
  style?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  availability?: DateCalendarAvailability & {
    onOpen: (date: string) => void;
    onClose: () => void;
  };
};

export function DatePickerField({
  error,
  label,
  required = false,
  maximumDate,
  minimumDate,
  onBlur,
  onChange,
  placeholder,
  value,
  displayFormat = 'long',
  style,
  fieldStyle,
  disabled = false,
  availability,
}: DatePickerFieldProps) {
  const busy = useFormBusy();
  const blocked = disabled || busy;
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const valueAsString = typeof value === 'string' ? value : '';
  const selectedDate = isValidIsoDate(valueAsString) ? valueAsString : '';
  const displayValue = selectedDate
    ? displayFormat === 'numeric'
      ? formatShortDate(selectedDate)
      : formatLongDate(selectedDate)
    : '';

  const openCalendar = () => {
    if (blocked) return;
    Keyboard.dismiss();
    const requestedDate = selectedDate || dateToIsoDate(new Date());
    const firstDate = minimumDate ? dateToIsoDate(minimumDate) : undefined;
    const lastDate = maximumDate ? dateToIsoDate(maximumDate) : undefined;
    const allowedDate =
      firstDate && requestedDate < firstDate ? firstDate : requestedDate;
    availability?.onOpen(
      lastDate && allowedDate > lastDate ? lastDate : allowedDate,
    );
    setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
    availability?.onClose();
    onBlur?.();
  };

  const selectDate = (dateString: string) => {
    if (
      blocked ||
      availability?.loading ||
      availability?.error ||
      availability?.disabledDates.includes(dateString)
    )
      return;
    onChange(dateString);
    closeCalendar();
  };

  return (
    <FormInput error={error} label={label} required={required} style={style}>
      <Pressable
        disabled={blocked}
        accessibilityState={{ disabled: blocked }}
        accessibilityLabel={label}
        accessibilityHint={required ? 'Câmp obligatoriu' : undefined}
        accessibilityRole="button"
        accessibilityValue={{ text: displayValue || placeholder }}
        onPress={openCalendar}
        style={[
          formInputStyles.field,
          formInputStyles.fieldDimensions,
          styles.field,
          error ? formInputStyles.fieldError : undefined,
          blocked ? formInputStyles.fieldDisabled : undefined,
          fieldStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            displayValue ? undefined : styles.placeholder,
          ]}
        >
          {displayValue || placeholder}
        </Text>
        <View style={styles.calendarIcon}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.primary}
          />
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={closeCalendar}
        statusBarTranslucent
        transparent
        visible={isCalendarOpen}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Închide calendarul"
            onPress={closeCalendar}
            style={styles.backdrop}
          />
          {isCalendarOpen ? (
            <DateCalendarPanel
              displayValue={displayValue}
              maximumDate={maximumDate ? dateToIsoDate(maximumDate) : undefined}
              minimumDate={minimumDate ? dateToIsoDate(minimumDate) : undefined}
              onClose={closeCalendar}
              onSelect={selectDate}
              selectedDate={selectedDate}
              availability={availability}
            />
          ) : null}
        </View>
      </Modal>
    </FormInput>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldText: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
    paddingRight: theme.spacing.sm,
  },
  placeholder: {
    color: theme.colors.subtle,
  },
  calendarIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.overlay,
  },
});
