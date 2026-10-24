import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingDetailsScreen } from '@/features/bookings/screens/BookingDetailsScreen';
import { BookingDetailsHeader } from '@/features/bookings/components/BookingDetailsHeader';
import { RootStackParamList } from '@/shared/navigation/types';
import { waitForUi } from '@/shared/test/waitForUi';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator<RootStackParamList>();

test('disabled capabilities hide financial controls and prevent optional requests', async () => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(
        jsonResponse(200, { ...plannerAccount, features: [] }),
      );
    }
    if (path.endsWith('/events/event-1')) {
      return Promise.resolve(jsonResponse(200, plannerBooking));
    }
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="EventDetails"
          component={BookingDetailsScreen}
          initialParams={{ eventId: 'event-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );

  await waitForUi(() => {
    expect(renderer.root.findByType(BookingDetailsHeader).props.canManage).toBe(
      true,
    );
  });
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Adaugă încasare sau cheltuială',
    }),
  ).toHaveLength(0);
  expect(JSON.stringify(renderer.toJSON())).not.toContain('Încasat:');
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(BookingDetailsHeader).props.onEdit();
  });
  const paths = jest
    .mocked(globalThis.fetch)
    .mock.calls.map(([url]) => String(url));
  expect(
    paths.some(path =>
      /\/payments|\/documents|\/employees|\/staff-availability/.test(path),
    ),
  ).toBe(false);
  await unmount();
});
