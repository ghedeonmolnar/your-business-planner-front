import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FormInput } from '@/shared/components/FormInput';
import {
  SelectFieldTrigger,
  selectFieldStyles,
} from '@/shared/components/select/SelectFieldTrigger';
import { SelectOptionRow } from '@/shared/components/select/SelectOptionRow';
import { SelectOption } from '@/shared/components/select/selectOptions';
import { theme } from '@/shared/theme/theme';

const MAX_VISIBLE_OPTIONS = 5;

type CalendarPeriodSelectProps = {
  testID: string;
  label: string;
  expanded: boolean;
  options: SelectOption<string>[];
  selectedValue: string;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

export function CalendarPeriodSelect({
  testID,
  label,
  expanded,
  options,
  selectedValue,
  onToggle,
  onSelect,
}: CalendarPeriodSelectProps) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const selectedOffset = useRef(0);
  const selectedLabel = options.find(
    option => option.id === selectedValue,
  )?.name;
  const scrollToSelection = () =>
    scrollRef.current?.scrollTo({ y: selectedOffset.current, animated: false });

  return (
    <FormInput label={label}>
      <SelectFieldTrigger
        testID={testID}
        accessibilityLabel={label}
        accessibilityValueText={selectedLabel ?? selectedValue}
        expanded={expanded}
        onPress={onToggle}
        placeholder={label}
      >
        <Text style={selectFieldStyles.value}>{selectedLabel}</Text>
      </SelectFieldTrigger>
      {expanded ? (
        <ScrollView
          testID={`${testID}-options`}
          ref={scrollRef}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToSelection}
          style={styles.options}
        >
          {options.map(option => (
            <View
              key={option.id}
              onLayout={
                option.id === selectedValue
                  ? event => {
                      selectedOffset.current = event.nativeEvent.layout.y;
                      scrollToSelection();
                    }
                  : undefined
              }
            >
              <SelectOptionRow
                option={option}
                selected={option.id === selectedValue}
                single
                onPress={value => onSelect(value.id)}
              />
            </View>
          ))}
        </ScrollView>
      ) : null}
    </FormInput>
  );
}

const styles = StyleSheet.create({
  options: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexGrow: 0,
    marginTop: theme.spacing.xs,
    maxHeight: theme.controls.fieldHeight * MAX_VISIBLE_OPTIONS,
  },
});
