import React, { useState } from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { Keyboard, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton';
import { useEmployeeRegistration } from '@/features/auth/hooks/useAuthMutations';
import {
  EmployeeRegistrationFormValues,
  employeeRegistrationSchema,
} from '@/features/auth/schemas/employeeRegistrationSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { showError } from '@/shared/feedback/showError';
import { apiErrorCode } from '@/shared/api/apiError';

export function EmployeeRegistrationPanel({ onBack }: { onBack: () => void }) {
  const registration = useEmployeeRegistration();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const form = useAppForm<EmployeeRegistrationFormValues>({
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
      {
        onError: error => {
          Keyboard.dismiss();
          showError(
            error,
            'Nu am putut crea contul.',
            {},
            apiErrorCode(error) === 'INVITATION_INVALID'
              ? {
                  title: 'Invitație invalidă sau expirată',
                  icon: 'ticket-outline',
                  tone: 'warning',
                  centered: true,
                  confirmLabel: 'Am înțeles',
                  cancelLabel: 'Înapoi la autentificare',
                  onCancel: onBack,
                }
              : undefined,
          );
        },
      },
    );
  });

  return (
    <FormPanel
      title="Creează contul"
      busy={registration.isPending}
      style={authPanelStyles.panel}
      titleStyle={authPanelStyles.panelTitle}
    >
      <ControlledTextField
        autoCapitalize="none"
        control={form.control}
        keyboardType="email-address"
        required
        label="Email"
        labelPlacement="above"
        autoComplete="email"
        leftIcon="at-circle-outline"
        name="email"
        placeholder="email@exemplu.ro"
      />
      <ControlledTextField
        control={form.control}
        autoCapitalize="none"
        required
        label="Cod invitație"
        labelPlacement="above"
        leftIcon="ticket-outline"
        name="code"
        placeholder="Codul complet din email"
      />
      <ControlledTextField
        control={form.control}
        required
        label="Parolă"
        labelPlacement="above"
        autoComplete="new-password"
        hint="Minimum 10 caractere, litere și cifre"
        leftIcon="key-outline"
        name="password"
        isPassword
        onRightIconPress={() => setPasswordVisible(visible => !visible)}
        placeholder="Parolă"
        rightIcon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          passwordVisible ? 'Ascunde parola' : 'Arată parola'
        }
        secureTextEntry={!passwordVisible}
      />
      <ControlledTextField
        control={form.control}
        required
        label="Confirmă parola"
        labelPlacement="above"
        autoComplete="new-password"
        leftIcon="key-outline"
        name="password_confirmation"
        isPassword
        placeholder="Confirmă parola"
        onRightIconPress={() => setConfirmationVisible(visible => !visible)}
        rightIcon={confirmationVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          confirmationVisible
            ? 'Ascunde confirmarea parolei'
            : 'Arată confirmarea parolei'
        }
        secureTextEntry={!confirmationVisible}
      />
      <AuthSubmitButton
        label="Creează contul"
        loadingLabel="Se creează contul…"
        loading={registration.isPending}
        onPress={onSubmit}
        icon="arrow-forward"
        iconPosition="right"
      />
      <View style={authPanelStyles.linkRow}>
        <Text style={authPanelStyles.muted}>Ai deja cont?</Text>
        <AppButton
          label="Autentifică-te"
          onPress={onBack}
          size="small"
          variant="ghost"
        />
      </View>
    </FormPanel>
  );
}
