import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { useResetPassword } from '@/features/auth/hooks/useAuthMutations';
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
  onResendCode: (email: string) => void;
};

export function ResetPasswordPanel({
  initialEmail,
  onPasswordReset,
  onResendCode,
}: ResetPasswordPanelProps) {
  const resetPassword = useResetPassword();
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const resetForm = useForm<ResetPasswordFormValues>({
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
          onPasswordReset(email);
          showMessage(
            'Parola resetată',
            'Parola a fost resetată. Te poți autentifica din nou.',
          );
        },
        onError: error => {
          showError(error, 'Nu am putut reseta parola.');
        },
      },
    );
  });

  return (
    <Card style={authPanelStyles.formPanel}>
      <Text style={authPanelStyles.panelTitle}>Cod resetare</Text>
      <ControlledTextField
        autoCapitalize="none"
        control={resetForm.control}
        keyboardType="email-address"
        label="Email"
        leftIcon="at-circle-outline"
        name="email"
        placeholder="email@exemplu.ro"
      />
      <ControlledTextField
        control={resetForm.control}
        keyboardType="number-pad"
        label="Cod"
        leftIcon="shield-checkmark-outline"
        name="code"
        placeholder="123456"
      />
      <ControlledTextField
        control={resetForm.control}
        label="Parolă nouă"
        leftIcon="key-outline"
        name="password"
        isPassword
        onRightIconPress={() => setNewPasswordVisible(visible => !visible)}
        placeholder="Minim 8 caractere"
        rightIcon={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          isNewPasswordVisible ? 'Ascunde parola' : 'Arată parola'
        }
        secureTextEntry={!isNewPasswordVisible}
      />
      <ControlledTextField
        control={resetForm.control}
        label="Confirmă parola"
        leftIcon="key-outline"
        name="password_confirmation"
        isPassword
        placeholder="Repetă parola"
        secureTextEntry={!isNewPasswordVisible}
      />
      <AppButton
        disabled={resetPassword.isPending}
        fullWidth
        icon="checkmark"
        iconPosition="right"
        label={resetPassword.isPending ? 'Se salvează...' : 'Resetează parola'}
        onPress={onSubmit}
        size="large"
      />
      <AppButton
        fullWidth
        label="Retrimite cod"
        onPress={() => onResendCode(resetForm.getValues('email').trim())}
        size="small"
        style={authPanelStyles.linkButton}
        variant="ghost"
      />
    </Card>
  );
}
