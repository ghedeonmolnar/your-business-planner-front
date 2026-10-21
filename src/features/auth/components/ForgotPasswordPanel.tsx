import React from 'react';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { useForgotPassword } from '@/features/auth/hooks/useAuthMutations';
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@/features/auth/schemas/passwordResetSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';

type ForgotPasswordPanelProps = {
  initialEmail: string;
  onBack: () => void;
  onCodeSent: (email: string) => void;
};

export function ForgotPasswordPanel({
  initialEmail,
  onBack,
  onCodeSent,
}: ForgotPasswordPanelProps) {
  const forgotPassword = useForgotPassword();
  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = forgotForm.handleSubmit(values => {
    const email = values.email.trim();

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          onCodeSent(email);
          showMessage(
            'Cod trimis',
            'Dacă adresa există, ți-am trimis un cod de resetare pe email.',
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
      <Text style={authPanelStyles.panelTitle}>Resetare parolă</Text>
      <ControlledTextField
        autoCapitalize="none"
        control={forgotForm.control}
        keyboardType="email-address"
        label="Email"
        leftIcon="at-circle-outline"
        name="email"
        placeholder="email@exemplu.ro"
      />
      <AppButton
        disabled={forgotPassword.isPending}
        fullWidth
        icon="mail-outline"
        iconPosition="right"
        label={forgotPassword.isPending ? 'Se trimite...' : 'Trimite cod'}
        onPress={onSubmit}
        size="large"
      />
      <AppButton
        fullWidth
        label="Înapoi la autentificare"
        onPress={onBack}
        size="small"
        style={authPanelStyles.linkButton}
        variant="ghost"
      />
    </Card>
  );
}
