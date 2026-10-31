import React, { useContext } from 'react';
import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { FormInput } from '@/shared/components/FormInput';
import { theme } from '@/shared/theme/theme';
import { IconName } from '@/shared/types/icon';
import {
  FormFocusContext,
  useFormBusy,
} from '@/shared/components/FormInteractionContext';
import { formFieldLabel } from '@/shared/utils/formFieldLabel';

type ControlledTextFieldProps<T extends FieldValues> = {
  control: Control<T, unknown, FieldValues>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numeric?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  rightIconAccessibilityLabel?: string;
  onRightIconPress?: () => void;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
};

export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  placeholder,
  keyboardType,
  secureTextEntry,
  isPassword = false,
  autoCapitalize,
  multiline,
  numeric = false,
  leftIcon,
  rightIcon,
  rightIconAccessibilityLabel,
  onRightIconPress,
  inputStyle,
  disabled = false,
  onValueChange,
  autoComplete,
}: ControlledTextFieldProps<T>) {
  const busy = useFormBusy();
  const revealFocusedInput = useContext(FormFocusContext);
  const blocked = busy || disabled;
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
      }) => (
        <FormInput
          error={error?.message}
          label={label}
          required={required}
          hideLabel
        >
          <TextInput
            testID={`input:${name}`}
            disabled={blocked}
            accessibilityLabel={label}
            accessibilityHint={required ? 'Câmp obligatoriu' : undefined}
            autoCapitalize={autoCapitalize ?? (isPassword ? 'none' : undefined)}
            autoCorrect={isPassword ? false : undefined}
            autoComplete={autoComplete}
            contentStyle={[
              styles.input,
              multiline ? styles.textArea : undefined,
              inputStyle,
            ]}
            error={Boolean(error)}
            keyboardType={keyboardType}
            label={formFieldLabel(label, required)}
            left={
              leftIcon ? (
                <TextInput.Icon
                  forceTextInputFocus={false}
                  icon={({ color, size }) => (
                    <Ionicons color={color} name={leftIcon} size={size} />
                  )}
                />
              ) : undefined
            }
            mode="outlined"
            multiline={multiline}
            onBlur={onBlur}
            onFocus={() => revealFocusedInput?.()}
            onChangeText={text => {
              if (!blocked) {
                onChange(text);
                onValueChange?.(text);
              }
            }}
            placeholder={placeholder}
            ref={ref}
            right={
              rightIcon ? (
                <TextInput.Icon
                  accessibilityLabel={rightIconAccessibilityLabel}
                  disabled={blocked || !onRightIconPress}
                  forceTextInputFocus={false}
                  icon={({ color, size }) => (
                    <Ionicons color={color} name={rightIcon} size={size} />
                  )}
                  onPress={() => {
                    if (!blocked) onRightIconPress?.();
                  }}
                />
              ) : undefined
            }
            secureTextEntry={secureTextEntry}
            selectTextOnFocus={numeric}
            style={styles.field}
            outlineStyle={styles.outline}
            outlineColor={theme.colors.menu.border}
            activeOutlineColor={theme.colors.menu.primary}
            value={value == null ? '' : String(value)}
          />
        </FormInput>
      )}
    />
  );
}

const styles = StyleSheet.create({
  outline: { borderRadius: theme.radius.md },
  field: {
    backgroundColor: theme.colors.surface,
    minHeight: theme.controls.fieldHeight,
  },
  input: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
    minHeight: theme.controls.fieldHeight,
  },
  textArea: {
    minHeight: theme.controls.fieldHeight * 2,
    textAlignVertical: 'top',
  },
});
