import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { FormInput } from '@/shared/components/FormInput';
import { SelectFieldTrigger } from '@/shared/components/select/SelectFieldTrigger';
import { theme } from '@/shared/theme/theme';

export const ratingValues = [5, 4, 3, 2, 1];

const STAR_SIZE = 22;

type StarRatingFieldProps = {
  label: string;
  onChange: (rating: number | null) => void;
  placeholder?: string;
  value: number | null;
};

export const ratingLabel = (rating: number) =>
  rating === 1 ? '1 stea' : `${rating} stele`;

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: rating }, (_, index) => (
        <Ionicons
          color={theme.colors.primary}
          key={index}
          name="star"
          size={STAR_SIZE}
        />
      ))}
    </View>
  );
}

export function StarRatingField({
  label,
  onChange,
  placeholder = 'Alege nota',
  value,
}: StarRatingFieldProps) {
  const [isOpen, setOpen] = useState(false);

  const select = (rating: number) => {
    onChange(rating);
    setOpen(false);
  };

  return (
    <FormInput label={label}>
      <SelectFieldTrigger
        accessibilityLabel={label}
        accessibilityValueText={value ? ratingLabel(value) : placeholder}
        expanded={isOpen}
        onClear={
          value
            ? () => {
                onChange(null);
                setOpen(false);
              }
            : undefined
        }
        onPress={() => setOpen(currentlyOpen => !currentlyOpen)}
        placeholder={placeholder}
      >
        {value ? <Stars rating={value} /> : null}
      </SelectFieldTrigger>

      {isOpen ? (
        <View style={styles.dropdown}>
          {ratingValues.map(rating => {
            const selected = value === rating;

            return (
              <Pressable
                accessibilityLabel={ratingLabel(rating)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={rating}
                onPress={() => select(rating)}
                style={({ pressed }) => [
                  styles.option,
                  selected ? styles.optionSelected : undefined,
                  pressed ? styles.optionPressed : undefined,
                ]}
              >
                <Stars rating={rating} />
                {selected ? (
                  <Ionicons
                    color={theme.colors.primary}
                    name="checkmark-circle"
                    size={22}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </FormInput>
  );
}

const styles = StyleSheet.create({
  stars: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginTop: theme.spacing.xs,
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  optionSelected: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  optionPressed: {
    opacity: 0.68,
  },
});
