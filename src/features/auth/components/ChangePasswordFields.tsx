import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text } from 'react-native-paper';
import { ChangePasswordValues } from '@/features/auth/schemas/changePasswordSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function ChangePasswordFields({
  form,
}: {
  form: UseFormReturn<ChangePasswordValues>;
}) {
  const [revealed, setRevealed] = useState<
    Partial<Record<keyof ChangePasswordValues, boolean>>
  >({});
  return (
    <>
      <Text style={styles.muted}>
        Alege o parolă diferită de cea actuală, cu cel puțin 8 caractere. După
        schimbare, te vei autentifica din nou pe toate dispozitivele.
      </Text>
      {(
        [
          ['current_password', 'Parola actuală', 'Introdu parola actuală'],
          ['password', 'Parola nouă', 'Introdu parola nouă'],
          [
            'password_confirmation',
            'Confirmă parola nouă',
            'Repetă parola nouă',
          ],
        ] as const
      ).map(([name, label, placeholder]) => (
        <ControlledTextField
          key={name}
          control={form.control}
          name={name}
          label={label}
          placeholder={placeholder}
          required
          isPassword
          secureTextEntry={!revealed[name]}
          autoComplete={
            name === 'current_password' ? 'current-password' : 'new-password'
          }
          rightIcon={revealed[name] ? 'eye-off-outline' : 'eye-outline'}
          rightIconAccessibilityLabel={`${revealed[name] ? 'Ascunde' : 'Arată'}: ${label.toLowerCase()}`}
          onRightIconPress={() =>
            setRevealed(current => ({ ...current, [name]: !current[name] }))
          }
        />
      ))}
    </>
  );
}
