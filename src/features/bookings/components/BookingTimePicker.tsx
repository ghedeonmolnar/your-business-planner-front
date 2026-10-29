import React, { useState } from 'react';
import { Keyboard, Pressable, useWindowDimensions, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { theme } from '@/shared/theme/theme';
import {
  bookingClock,
  bookingTimeChoices,
} from '@/features/bookings/utils/bookingSchedule';
import { bookingTimePickerStyles as styles } from '@/features/bookings/components/bookingTimePickerStyles';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const QUICK_MINUTE_STEP = 5;
const MINIMUM_GRID_COLUMNS = 2;
const MAXIMUM_GRID_COLUMNS = 6;
const digits = (value: number | string) => String(value).padStart(2, '0');

export function BookingTimePicker({
  date,
  start,
  end = false,
  value,
  label,
  onChange,
  onClose,
}: {
  date: string;
  start: string;
  end?: boolean;
  value: string;
  label: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const initial = bookingClock(value) || '00:00';
  const { width, fontScale } = useWindowDimensions();
  const columns = Math.max(
    MINIMUM_GRID_COLUMNS,
    Math.min(
      MAXIMUM_GRID_COLUMNS,
      Math.floor(
        (width - theme.spacing.lg * 4) /
          ((theme.controls.fieldHeight - theme.spacing.xs) * fontScale),
      ),
    ),
  );
  const [hour, setHour] = useState(initial.slice(0, 2));
  const [minute, setMinute] = useState(initial.slice(3, 5));
  const [part, setPart] = useState<'hour' | 'minute'>('hour');
  const [occurrence, setOccurrence] = useState(value);
  const validNumbers =
    /^\d{1,2}$/.test(hour) &&
    /^\d{1,2}$/.test(minute) &&
    Number(hour) < HOURS_PER_DAY &&
    Number(minute) < MINUTES_PER_HOUR;
  const clock = `${digits(hour)}:${digits(minute)}`;
  const choices = validNumbers
    ? bookingTimeChoices(date, clock, start, end)
    : [];
  const selected =
    choices.length === 1
      ? choices[0]
      : choices.find(choice => choice.id === occurrence);
  const values = Array.from(
    {
      length:
        part === 'hour' ? HOURS_PER_DAY : MINUTES_PER_HOUR / QUICK_MINUTE_STEP,
    },
    (_, index) => digits(part === 'hour' ? index : index * QUICK_MINUTE_STEP),
  );
  const confirm = () => {
    if (!selected) return;
    onChange(selected.id);
    onClose();
  };
  return (
    <FormModalFrame
      visible
      fitContent
      title={label}
      closeLabel="Închide alegerea orei"
      onClose={onClose}
      footer={
        <View style={styles.actions}>
          <AppButton
            label={selected ? `Folosește ${selected.name}` : 'Confirmă ora'}
            disabled={!selected}
            onPress={confirm}
          />
          {value ? (
            <AppButton
              label="Șterge ora"
              variant="ghost"
              onPress={() => {
                onChange('');
                onClose();
              }}
            />
          ) : null}
        </View>
      }
    >
      <View style={styles.inputs}>
        {(['hour', 'minute'] as const).map(input => (
          <TextInput
            key={input}
            accessibilityLabel={
              input === 'hour' ? 'Oră, între 00 și 23' : 'Minut, între 00 și 59'
            }
            label={input === 'hour' ? 'Oră *' : 'Minut *'}
            accessibilityHint="Câmp obligatoriu"
            mode="outlined"
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            value={input === 'hour' ? hour : minute}
            onFocus={() => setPart(input)}
            onChangeText={text => {
              if (/^\d{0,2}$/.test(text))
                (input === 'hour' ? setHour : setMinute)(text);
            }}
            onBlur={() => {
              if (input === 'hour' && hour) setHour(digits(hour));
              if (input === 'minute' && minute) setMinute(digits(minute));
            }}
            style={styles.input}
            contentStyle={styles.inputText}
            outlineColor={
              part === input ? theme.colors.primary : theme.colors.border
            }
            outlineStyle={{ borderRadius: theme.radius.md }}
          />
        ))}
      </View>
      <Text style={styles.text}>
        {part === 'hour'
          ? 'Alege ora, apoi minutul.'
          : 'Alege minutul sau introdu orice valoare între 00 și 59.'}
      </Text>
      <View style={styles.grid}>
        {values.map(number => {
          const active = number === digits(part === 'hour' ? hour : minute);
          return (
            <View
              key={number}
              style={[styles.cell, { width: `${100 / columns}%` }]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${part === 'hour' ? 'Ora' : 'Minutul'} ${number}`}
                accessibilityState={{ selected: active }}
                hitSlop={theme.spacing.xs}
                style={[styles.choice, active ? styles.selected : undefined]}
                onPress={() => {
                  Keyboard.dismiss();
                  if (part === 'hour') {
                    setHour(number);
                    setPart('minute');
                  } else setMinute(number);
                }}
              >
                <Text
                  style={[
                    styles.choiceText,
                    active ? styles.selectedText : undefined,
                  ]}
                >
                  {number}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      {!validNumbers ? (
        <Text accessibilityRole="alert" style={[styles.text, styles.error]}>
          Introdu o oră între 00:00 și 23:59.
        </Text>
      ) : !choices.length ? (
        <Text accessibilityRole="alert" style={[styles.text, styles.error]}>
          Ora aleasă nu există în această zi, din cauza schimbării orei. Alege
          altă oră.
        </Text>
      ) : null}
      {choices.length > 1 ? (
        <View style={styles.actions}>
          <Text style={styles.text}>
            Ora se repetă în această zi. Alege apariția dorită.
          </Text>
          {choices.map(choice => (
            <AppButton
              key={choice.id}
              label={choice.name}
              variant={selected?.id === choice.id ? 'primary' : 'outline'}
              onPress={() => setOccurrence(choice.id)}
            />
          ))}
        </View>
      ) : selected && end && selected.id.slice(0, 10) !== date ? (
        <Text style={styles.text}>Sfârșitul este a doua zi.</Text>
      ) : null}
    </FormModalFrame>
  );
}
