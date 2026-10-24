import React, { useState } from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { FormActions } from '@/shared/components/FormActions';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { useEmployeeRegistration } from '@/features/auth/hooks/useAuthMutations';
import {
  EmployeeRegistrationFormValues,
  employeeRegistrationSchema,
} from '@/features/auth/schemas/employeeRegistrationSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { showError } from '@/shared/feedback/showError';

export function EmployeeRegistrationPanel({ onBack }: { onBack: () => void }) {
  const registration = useEmployeeRegistration();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const form = useForm<EmployeeRegistrationFormValues>({
    resolver: zodResolver(employeeRegistrationSchema),
    defaultValues: {
      email: '',
      code: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = form.handleSubmit(values => {
    registration.mutate(
      { ...values, email: values.email.trim(), code: values.code.trim() },
      { onError: error => showError(error, 'Nu am putut crea contul.') },
    );
  });

  return (
    <FormPanel title="Acceptă invitația" busy={registration.isPending}>
      <Text>
        Introdu adresa și codul din emailul de invitație, înainte să expire.
      </Text>
      <ControlledTextField
        autoCapitalize="none"
        control={form.control}
        keyboardType="email-address"
        label="Email"
        name="email"
        placeholder="email@exemplu.ro"
      />
      <ControlledTextField
        control={form.control}
        autoCapitalize="none"
        label="Cod invitație"
        name="code"
        placeholder="Codul complet din email"
      />
      <ControlledTextField
        control={form.control}
        label="Parolă"
        name="password"
        isPassword
        onRightIconPress={() => setPasswordVisible(visible => !visible)}
        placeholder="Minim 10 caractere, litere și cifre"
        rightIcon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          passwordVisible ? 'Ascunde parola' : 'Arată parola'
        }
        secureTextEntry={!passwordVisible}
      />
      <ControlledTextField
        control={form.control}
        label="Confirmă parola"
        name="password_confirmation"
        isPassword
        placeholder="Repetă parola"
        secureTextEntry={!passwordVisible}
      />
      <FormActions
        busy={registration.isPending}
        primary={{
          label: 'Creează contul',
          loadingLabel: 'Se creează contul…',
          onPress: onSubmit,
        }}
      />
      <AppButton
        fullWidth
        label="Înapoi la autentificare"
        onPress={onBack}
        size="small"
        style={authPanelStyles.linkButton}
        variant="ghost"
      />
    </FormPanel>
  );
}
