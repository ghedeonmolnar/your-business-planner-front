import React from 'react';
import { Pressable } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import RootNavigator from '@/app/navigation/RootNavigator';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { navigationRef } from '@/shared/navigation/navigationRef';
import { getAuthToken } from '@/shared/storage/authTokenStorage';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('stored-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/features/events/notifications/EventRemindersSync', () => ({
  EventRemindersSync: () => null,
}));
jest.mock('@/features/events/notifications/useNotificationNavigation', () => ({
  useNotificationNavigation: () => {},
}));

function SignOutControl() {
  const { signOut } = useAuth();
  return (
    <Pressable
      accessibilityLabel="Închide sesiunea"
      onPress={() => signOut({ remote: false })}
    />
  );
}

test('logout removes protected history so Back cannot reopen booking details', async () => {
  globalThis.fetch = jest.fn(async url => {
    const path = String(url);
    if (path.endsWith('/me')) return jsonResponse(200, plannerAccount);
    if (path.endsWith('/events/event-1'))
      return jsonResponse(200, plannerBooking);
    return paginatedResponse([]);
  }) as typeof globalThis.fetch;
  const { renderer, unmount, queryClient } = await renderWithProviders(
    <>
      <RootNavigator />
      <SignOutControl />
    </>,
  );
  await ReactTestRenderer.act(async () => {
    navigationRef.navigate('EventDetails', { eventId: plannerBooking.id });
  });
  expect(navigationRef.getCurrentRoute()?.name).toBe('EventDetails');
  jest.mocked(getAuthToken).mockResolvedValue(null);
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: 'Închide sesiunea' })
      .props.onPress();
  });
  expect(renderer.root.findAllByType(LoginScreen)).toHaveLength(1);
  expect(navigationRef.getRootState()?.routeNames).toEqual(['Login']);
  expect(navigationRef.canGoBack()).toBe(false);
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  await unmount();
});
