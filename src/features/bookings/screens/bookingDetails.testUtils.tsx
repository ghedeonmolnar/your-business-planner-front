import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthUser } from '@/features/auth/types';
import { Booking } from '@/features/bookings/types';
import { BookingDetailsScreen } from '@/features/bookings/screens/BookingDetailsScreen';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { RootStackParamList } from '@/shared/navigation/types';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const pressBookingDetails = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });
};

export const renderBookingDetails = async (
  overrides: Partial<Booking> = {},
  account: Partial<AuthUser> = {},
) => {
  let booking = {
    ...plannerBooking,
    incoming_payments_count: 1,
    outgoing_payments_count: 0,
    documents_count: 0,
    ...overrides,
  };
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(
        jsonResponse(200, { ...plannerAccount, ...account }),
      );
    if (path.endsWith('/events/event-1')) {
      if (init?.method === 'DELETE')
        booking = { ...booking, status: 'cancelled', version: 2 };
      return Promise.resolve(jsonResponse(200, booking));
    }
    if (path.endsWith('/catalogs'))
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [{ id: 'nunta', name: 'Nuntă' }],
          client_sources: [],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [],
        }),
      );
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
  const mounted = await renderWithProviders(
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
    expect(JSON.stringify(mounted.renderer.toJSON())).toContain('Client test');
  });
  return mounted;
};
