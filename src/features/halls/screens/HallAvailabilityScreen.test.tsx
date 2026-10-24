import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HallAvailabilityScreen } from '@/features/halls/screens/HallAvailabilityScreen';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { RootStackParamList } from '@/shared/navigation/types';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator<RootStackParamList>();
test('disponibilitatea păstrează identificatorul sălii pentru sumar și lista zilnică', async () => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.includes('/calendar/day?'))
      return Promise.resolve(paginatedResponse([]));
    return Promise.resolve(
      jsonResponse(200, {
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days: [],
      }),
    );
  }) as typeof globalThis.fetch;
  const { unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="HallAvailability"
          component={HallAvailabilityScreen}
          initialParams={{ hallId: 'hall-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
  await waitForUi(() => {
    const paths = jest
      .mocked(globalThis.fetch)
      .mock.calls.map(([url]) => String(url));
    expect(
      paths.some(
        path => path.includes('/calendar?') && path.includes('hall_id=hall-1'),
      ),
    ).toBe(true);
    expect(
      paths.some(
        path =>
          path.includes('/calendar/day?') && path.includes('hall_id=hall-1'),
      ),
    ).toBe(true);
  });
  await unmount();
});
