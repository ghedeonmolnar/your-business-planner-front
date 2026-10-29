import React from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { FormActions } from '@/shared/components/FormActions';
import { useAppForm } from '@/shared/hooks/useAppForm';
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
  const forgotForm = useAppForm<ForgotPasswordFormValues>({
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
            'Solicitare înregistrată',
            'Dacă adresa există, vei primi prin email codul de resetare. Expedierea se reîncearcă automat la nevoie.',
          );
        },
        onError: error => {
          showError(error, 'Nu am putut reseta parola.');
        },
      },
    );
  });

  return (
    <FormPanel title="Resetare parolă" busy={forgotPassword.isPending}>
      <ControlledTextField
        autoCapitalize="none"
        control={forgotForm.control}
        keyboardType="email-address"
        required
        label="Email"
        leftIcon="at-circle-outline"
        name="email"
        placeholder="email@exemplu.ro"
      />
      <FormActions
        busy={forgotPassword.isPending}
        primary={{
          label: 'Trimite cod',
          loadingLabel: 'Se trimite…',
          onPress: onSubmit,
          icon: 'mail-outline',
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
