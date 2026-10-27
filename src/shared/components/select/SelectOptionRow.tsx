import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import {
  SelectOption,
  SelectValue,
} from '@/shared/components/select/selectOptions';
import { selectOptionsModalStyles as styles } from '@/shared/components/select/selectOptionsModalStyles';
import { theme } from '@/shared/theme/theme';

type SelectOptionRowProps<TValue extends SelectValue> = {
  option: SelectOption<TValue>;
  selected: boolean;
  single: boolean;
  onPress: (option: SelectOption<TValue>) => void;
};

export function SelectOptionRow<TValue extends SelectValue>({
  option,
  selected,
  single,
  onPress,
}: SelectOptionRowProps<TValue>) {
  return (
    <Pressable
      testID={`select-option:${String(option.id)}`}
      accessibilityLabel={option.name}
      accessibilityRole={single ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, disabled: option.disabled }}
      disabled={option.disabled}
      onPress={() => onPress(option)}
      style={({ pressed }) => [
        styles.optionRow,
        selected ? styles.optionRowSelected : undefined,
        option.disabled ? styles.optionRowDisabled : undefined,
        pressed && !option.disabled ? styles.optionRowPressed : undefined,
      ]}
    >
      <View style={styles.optionCopy}>
        <Text
          style={[
            styles.optionText,
            selected ? styles.optionTextSelected : undefined,
            option.disabled ? styles.optionTextDisabled : undefined,
          ]}
        >
          {option.name}
        </Text>
        {option.description ? (
          <Text style={styles.optionDescription}>{option.description}</Text>
        ) : null}
      </View>
      {selected ? (
        <Ionicons
          color={theme.colors.primary}
          name="checkmark-circle"
          size={22}
        />
      ) : null}
    </Pressable>
  );
}
