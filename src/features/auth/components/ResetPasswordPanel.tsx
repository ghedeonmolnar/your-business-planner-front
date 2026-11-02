import React, { useState } from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { Keyboard, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton';
import {
  useForgotPassword,
  useResetPassword,
} from '@/features/auth/hooks/useAuthMutations';
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/features/auth/schemas/passwordResetSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';

type ResetPasswordPanelProps = {
  initialEmail: string;
  onPasswordReset: (email: string) => void;
};

export function ResetPasswordPanel({
  initialEmail,
  onPasswordReset,
}: ResetPasswordPanelProps) {
  const resetPassword = useResetPassword();
  const resendCode = useForgotPassword();
  const busy = resetPassword.isPending || resendCode.isPending;
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const resetForm = useAppForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = resetForm.handleSubmit(values => {
    const email = values.email.trim();

    resetPassword.mutate(
      {
        email,
        code: values.code.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onSuccess: () => {
          Keyboard.dismiss();
          showMessage(
            'Parolă actualizată',
            'Te poți autentifica folosind parola nouă.',
            {
              icon: 'checkmark',
              tone: 'success',
              centered: true,
              confirmLabel: 'Înapoi la autentificare',
              onConfirm: () => onPasswordReset(email),
              onCancel: () => onPasswordReset(email),
            },
          );
        },
        onError: error => {
          showError(error, 'Nu am putut reseta parola.');
        },
      },
    );
  });

  const resend = async () => {
    if (!(await resetForm.trigger('email'))) return;
    resendCode.mutate(
      { email: resetForm.getValues('email').trim() },
      {
        onSuccess: () => {
          Keyboard.dismiss();
          resetForm.resetField('code');
          showMessage(
            'Solicitare înregistrată',
            'Dacă adresa există, vei primi prin email codul de resetare. Expedierea se reîncearcă automat la nevoie.',
          );
        },
        onError: error => showError(error, 'Nu am putut retrimite codul.'),
      },
    );
  };

  return (
    <FormPanel busy={busy} style={authPanelStyles.panel}>
      <ControlledTextField
        autoCapitalize="none"
        control={resetForm.control}
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
        control={resetForm.control}
        keyboardType="number-pad"
        required
        label="Cod de resetare"
        labelPlacement="above"
        autoComplete="one-time-code"
        hint="Codul conține 6 cifre."
        leftIcon="shield-checkmark-outline"
        name="code"
        placeholder="123456"
      />
      <ControlledTextField
        control={resetForm.control}
        required
        label="Parolă nouă"
        labelPlacement="above"
        autoComplete="new-password"
        hint="Minimum 8 caractere"
        leftIcon="key-outline"
        name="password"
        isPassword
        onRightIconPress={() => setNewPasswordVisible(visible => !visible)}
        placeholder="Introdu parola nouă"
        rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          isNewPasswordVisible ? 'Ascunde parola' : 'Arată parola'
        }
        secureTextEntry={!isNewPasswordVisible}
      />
      <ControlledTextField
        control={resetForm.control}
        required
        label="Confirmă parola"
        labelPlacement="above"
        autoComplete="new-password"
        leftIcon="key-outline"
        name="password_confirmation"
        isPassword
        placeholder="Introdu parola din nou"
        onRightIconPress={() => setConfirmationVisible(visible => !visible)}
        rightIcon={isConfirmationVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          isConfirmationVisible
            ? 'Ascunde confirmarea parolei'
            : 'Arată confirmarea parolei'
        }
        secureTextEntry={!isConfirmationVisible}
      />
      <AuthSubmitButton
        label="Resetează parola"
        loadingLabel="Se salvează…"
        loading={resetPassword.isPending}
        onPress={onSubmit}
        icon="arrow-forward"
      />
      <View style={authPanelStyles.linkRow}>
        <Text style={authPanelStyles.muted}>Nu ai primit codul?</Text>
        <AppButton
          label="Retrimite codul"
          loading={resendCode.isPending}
          loadingLabel="Se trimite…"
          onPress={resend}
          size="small"
          variant="ghost"
        />
      </View>
    </FormPanel>
  );
}
