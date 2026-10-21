import React from 'react';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import ReactTestRenderer from 'react-test-renderer';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthUser } from '@/features/auth/types';
import { jsonResponse } from '@/shared/test/renderWithProviders';

export const employeeAccount: AuthUser = {
  id: 'user-1',
  name: 'Animator',
  email: 'animator@example.com',
  role: 'employee',
  employee_id: 'employee-1',
};

export const eventReminderIds = [
  'event-start-event-1-24h',
  'event-payment-event-1',
];

export const revokedSession = () =>
  jsonResponse(401, { message: 'Sesiunea nu mai este activă.' });

export const flushAsyncWork = () =>
  ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

export function SessionState() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <Text>se verifică sesiunea</Text>;
  }

  return (
    <Text>
      {isAuthenticated ? `sesiune activă: ${user?.role}` : 'fără sesiune'}
    </Text>
  );
}

export function SessionControls() {
  const { signIn, signOut } = useAuth();

  return (
    <>
      <SessionState />
      <Pressable
        accessibilityLabel="Conectare"
        accessibilityRole="button"
        onPress={() => signIn('next-token', employeeAccount)}
      >
        <Text>Conectare</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Deconectare"
        accessibilityRole="button"
        onPress={() => signOut({ remote: false })}
      >
        <Text>Deconectare</Text>
      </Pressable>
    </>
  );
}
