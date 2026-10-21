import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useForm } from 'react-hook-form';
import { TextInput as TextField } from 'react-native-paper';
import { ControlledTextField } from '@/shared/components/ControlledTextField';

type PasswordFormValues = {
  password: string;
};

function LongPasswordField() {
  const { control } = useForm<PasswordFormValues>({
    defaultValues: {
      password: 'a'.repeat(200),
    },
  });

  return (
    <ControlledTextField
      control={control}
      label="Parola"
      name="password"
      onRightIconPress={() => undefined}
      placeholder="Parola contului"
      rightIcon="eye-outline"
      rightIconAccessibilityLabel="Arată parola"
      secureTextEntry
    />
  );
}

test('keeps the password visibility button inside the field for long values', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<LongPasswordField />);
  });

  const textField = renderer?.root.findByType(TextField);
  const visibilityButton = textField?.props.right;

  expect(textField?.props.value).toHaveLength(200);
  expect(visibilityButton.type).toBe(TextField.Icon);
  expect(visibilityButton.props).toMatchObject({
    accessibilityLabel: 'Arată parola',
    forceTextInputFocus: false,
  });

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

type AmountFormValues = {
  transport_cost: number;
};

function AmountField({ numeric }: { numeric?: boolean }) {
  const { control } = useForm<AmountFormValues>({
    defaultValues: { transport_cost: 0 },
  });

  return (
    <ControlledTextField
      control={control}
      keyboardType="numeric"
      label="Cost transport"
      name="transport_cost"
      numeric={numeric}
      placeholder="Ex: 100"
    />
  );
}

test('numeric fields select their value on focus so typing replaces the zero', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <>
        <AmountField numeric />
        <AmountField />
      </>,
    );
  });

  const [numericField, textField] =
    renderer?.root.findAllByType(TextField) ?? [];

  expect(numericField.props.value).toBe('0');
  expect(numericField.props.selectTextOnFocus).toBe(true);
  expect(textField.props.selectTextOnFocus).toBe(false);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
