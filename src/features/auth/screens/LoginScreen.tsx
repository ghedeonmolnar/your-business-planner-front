import React, {
  ComponentRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  BackHandler,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { ForgotPasswordPanel } from '@/features/auth/components/ForgotPasswordPanel';
import { EmployeeRegistrationPanel } from '@/features/auth/components/EmployeeRegistrationPanel';
import { LoginPanel } from '@/features/auth/components/LoginPanel';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { AuthSubmitContext } from '@/features/auth/components/AuthSubmitButton';
import { AuthMode } from '@/features/auth/types';
import { ResetPasswordPanel } from '@/features/auth/components/ResetPasswordPanel';
import { Screen } from '@/shared/components/Screen';
import { FormFocusContext } from '@/shared/components/FormInteractionContext';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { theme } from '@/shared/theme/theme';

const AUTH_CONTENT_MAX_WIDTH = 480;

export function LoginScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const submitRef = useRef<ComponentRef<typeof View>>(null);
  const scrollOffset = useRef(0);
  const keyboardOverlap = useKeyboardOverlap(Platform.OS === 'android');
  const revealFocusedInput = useCallback(() => {
    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;
    scrollRef.current?.measureInWindow(
      (_scrollX, scrollTop, _scrollWidth, scrollHeight) => {
        const availableHeight = Math.max(0, scrollHeight - keyboardOverlap);
        input.measureInWindow((_inputX, inputTop, _inputWidth, inputHeight) => {
          submitRef.current?.measureInWindow(
            (_actionX, actionTop, _actionWidth, actionHeight) => {
              const targetBottom = Math.min(
                actionTop + actionHeight,
                inputTop +
                  Math.max(inputHeight, availableHeight - theme.spacing.xl),
              );
              const overflow =
                targetBottom + theme.spacing.lg - scrollTop - availableHeight;
              if (overflow > 0) {
                scrollRef.current?.scrollTo({
                  y: scrollOffset.current + overflow,
                  animated: true,
                });
              }
            },
          );
        });
      },
    );
  }, [keyboardOverlap]);

  useEffect(() => {
    const subscription = Keyboard.addListener(
      'keyboardDidShow',
      revealFocusedInput,
    );
    return () => subscription.remove();
  }, [revealFocusedInput]);

  useEffect(() => {
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (authMode === 'login') return false;
        setAuthMode('login');
        return true;
      },
    );
    return () => subscription.remove();
  }, [authMode]);

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

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            Platform.OS === 'android'
              ? { paddingBottom: theme.spacing.xl + keyboardOverlap }
              : undefined,
          ]}
          onContentSizeChange={revealFocusedInput}
          onLayout={revealFocusedInput}
          onScroll={event => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          keyboardShouldPersistTaps="handled"
        >
          <FormFocusContext.Provider value={revealFocusedInput}>
            <AuthSubmitContext.Provider value={submitRef}>
              <View style={styles.body}>
                <AuthHeader
                  mode={authMode}
                  onBack={() => setAuthMode('login')}
                />

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
                  />
                ) : null}

                {authMode === 'register' ? (
                  <EmployeeRegistrationPanel
                    onBack={() => setAuthMode('login')}
                  />
                ) : null}
              </View>
            </AuthSubmitContext.Provider>
          </FormFocusContext.Provider>
          {authMode === 'login' ? (
            <Text style={styles.footer}>Your Business Planner</Text>
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  body: {
    width: '100%',
    maxWidth: AUTH_CONTENT_MAX_WIDTH,
    gap: theme.spacing.xxl,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.xxl,
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    textAlign: 'center',
  },
});
