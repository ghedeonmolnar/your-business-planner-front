import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ForgotPasswordPanel } from '@/features/auth/components/ForgotPasswordPanel';
import { EmployeeRegistrationPanel } from '@/features/auth/components/EmployeeRegistrationPanel';
import { LoginPanel } from '@/features/auth/components/LoginPanel';
import { LoginBrandLogo } from '@/features/auth/components/LoginBrandLogo';
import { ResetPasswordPanel } from '@/features/auth/components/ResetPasswordPanel';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';

type AuthMode = 'login' | 'forgot' | 'reset' | 'register';

export function LoginScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const openForgotPassword = (typedUsername: string) => {
    setUsername(typedUsername);
    setResetEmail(typedUsername.includes('@') ? typedUsername : '');
    setAuthMode('forgot');
  };

  const openResetPassword = (email: string) => {
    setResetEmail(email);
    setAuthMode('reset');
  };

  const returnToLogin = (email: string) => {
    setUsername(email);
    setAuthMode('login');
  };

  const resendResetCode = (email: string) => {
    setResetEmail(email);
    setAuthMode('forgot');
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          keyboardShouldPersistTaps="handled"
        >
          <LoginBrandLogo />

          {authMode === 'login' ? (
            <LoginPanel
              initialUsername={username}
              onForgotPassword={openForgotPassword}
              onRegisterEmployee={() => setAuthMode('register')}
            />
          ) : null}

          {authMode === 'forgot' ? (
            <ForgotPasswordPanel
              initialEmail={resetEmail}
              onBack={() => setAuthMode('login')}
              onCodeSent={openResetPassword}
            />
          ) : null}

          {authMode === 'reset' ? (
            <ResetPasswordPanel
              initialEmail={resetEmail}
              onPasswordReset={returnToLogin}
              onResendCode={resendResetCode}
            />
          ) : null}

          {authMode === 'register' ? (
            <EmployeeRegistrationPanel onBack={() => setAuthMode('login')} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});
