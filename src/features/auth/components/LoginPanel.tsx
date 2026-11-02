import React, { useState } from 'react';
import { FormPanel } from '@/shared/components/FormPanel';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton';
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
    <>
      <FormPanel
        title="Autentificare"
        busy={login.isPending}
        style={authPanelStyles.panel}
        titleStyle={authPanelStyles.panelTitle}
      >
        <ControlledTextField
          autoCapitalize="none"
          control={loginForm.control}
          required
          label="Email"
          labelPlacement="above"
          keyboardType="email-address"
          autoComplete="email"
          leftIcon="mail-outline"
          name="username"
          placeholder="email@exemplu.ro"
        />
        <ControlledTextField
          control={loginForm.control}
          required
          label="Parolă"
          labelPlacement="above"
          autoComplete="current-password"
          leftIcon="key-outline"
          name="password"
          isPassword
          onRightIconPress={() => setPasswordVisible(visible => !visible)}
          placeholder="Introdu parola"
          rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          rightIconAccessibilityLabel={
            isPasswordVisible ? 'Ascunde parola' : 'Arată parola'
          }
          secureTextEntry={!isPasswordVisible}
        />
        <AppButton
          label="Ai uitat parola?"
          onPress={() => onForgotPassword(loginForm.getValues('username'))}
          size="small"
          style={authPanelStyles.forgotLink}
          variant="ghost"
        />
        <AuthSubmitButton
          label="Intră în aplicație"
          loadingLabel="Se autentifică…"
          loading={login.isPending}
          onPress={onSubmit}
          icon="arrow-forward"
        />
      </FormPanel>
      <View style={authPanelStyles.invitation}>
        <View style={authPanelStyles.divider}>
          <View style={authPanelStyles.line} />
          <Text style={[authPanelStyles.muted, authPanelStyles.dividerText]}>
            Ai primit o invitație în echipă?
          </Text>
          <View style={authPanelStyles.line} />
        </View>
        <AppButton
          fullWidth
          multiline
          label="Activează contul"
          disabled={login.isPending}
          onPress={onRegisterEmployee}
          style={authPanelStyles.outlineButton}
          variant="outline"
        />
      </View>
    </>
  );
}
