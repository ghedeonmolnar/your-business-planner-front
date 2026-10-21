import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
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
  const loginForm = useForm<LoginFormValues>({
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
    <Card style={authPanelStyles.formPanel}>
      <Text style={authPanelStyles.panelTitle}>Autentificare</Text>
      <ControlledTextField
        autoCapitalize="none"
        control={loginForm.control}
        label="Email"
        leftIcon="at-circle-outline"
        name="username"
        placeholder="email@exemplu.ro"
      />
      <ControlledTextField
        control={loginForm.control}
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
      <AppButton
        disabled={login.isPending}
        fullWidth
        icon="arrow-forward"
        iconPosition="right"
        label={login.isPending ? 'Se autentifică...' : 'Intră în aplicație'}
        onPress={onSubmit}
        size="large"
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
    </Card>
  );
}
