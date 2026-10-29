import React, { useState } from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { FormActions } from '@/shared/components/FormActions';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { useLogin } from '@/features/auth/hooks/useAuthMutations';
import {
  LoginFormValues,
  loginSchema,
} from '@/features/auth/schemas/loginSchema';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { showError } from '@/shared/feedback/showError';

type LoginPanelProps = {
  initialUsername: string;
  onForgotPassword: (typedUsername: string) => void;
  onRegisterEmployee: () => void;
};

export function LoginPanel({
  initialUsername,
  onForgotPassword,
  onRegisterEmployee,
}: LoginPanelProps) {
  const login = useLogin();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const loginForm = useAppForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: initialUsername,
      password: '',
    },
  });

  const onSubmit = loginForm.handleSubmit(values => {
    login.mutate(
      {
        username: values.username.trim(),
        password: values.password,
      },
      {
        onError: error => {
          showError(error, 'Nu am putut face autentificarea.');
        },
      },
    );
  });

  return (
    <FormPanel title="Autentificare" busy={login.isPending}>
      <ControlledTextField
        autoCapitalize="none"
        control={loginForm.control}
        required
        label="Email"
        leftIcon="at-circle-outline"
        name="username"
        placeholder="email@exemplu.ro"
      />
      <ControlledTextField
        control={loginForm.control}
        required
        label="Parolă"
        leftIcon="key-outline"
        name="password"
        isPassword
        onRightIconPress={() => setPasswordVisible(visible => !visible)}
        placeholder="Parola contului"
        rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        rightIconAccessibilityLabel={
          isPasswordVisible ? 'Ascunde parola' : 'Arată parola'
        }
        secureTextEntry={!isPasswordVisible}
      />
      <FormActions
        busy={login.isPending}
        primary={{
          label: 'Intră în aplicație',
          loadingLabel: 'Se autentifică…',
          onPress: onSubmit,
          icon: 'arrow-forward',
        }}
      />
      <AppButton
        fullWidth
        label="Ai uitat parola?"
        onPress={() => onForgotPassword(loginForm.getValues('username'))}
        size="small"
        style={authPanelStyles.linkButton}
        variant="ghost"
      />
      <AppButton
        fullWidth
        label="Am primit invitație"
        onPress={onRegisterEmployee}
        size="small"
        style={authPanelStyles.linkButton}
        variant="ghost"
      />
    </FormPanel>
  );
}
