import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Hall } from '@/features/halls/types';
import { HallDetailsScreen } from '@/features/halls/screens/HallDetailsScreen';
import { HallFormScreen } from '@/features/halls/screens/HallFormScreen';
import { HallBookingsScreen } from '@/features/halls/screens/HallBookingsScreen';
import { HallsScreen } from '@/features/halls/screens/HallsScreen';
import { hallFixture } from '@/features/halls/utils/hallTestFixtures';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { RootStackParamList } from '@/shared/navigation/types';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { catalogsFixture } from '@/shared/test/apiFixtures';

const Stack = createNativeStackNavigator<RootStackParamList>();
const BlankScreen = () => null;

export const hallFetch = (overrides: Partial<Hall> = {}) => {
  let hall = { ...hallFixture, ...overrides };
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/halls/address-suggestions'))
      return Promise.resolve(jsonResponse(200, { suggestions: [] }));
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/halls/hall-1/status')) {
      hall = { ...hall, is_active: !hall.is_active, version: hall.version + 1 };
      return Promise.resolve(jsonResponse(200, hall));
    }
    if (
      path.endsWith('/halls/hall-1') ||
      (path.endsWith('/halls') && init?.method === 'POST')
    )
      return Promise.resolve(jsonResponse(200, hall));
    if (path.includes('/halls?'))
      return Promise.resolve(
        jsonResponse(200, {
          data: [hall],
          meta: {
            current_page: 1,
            last_page: 1,
            total: 1,
            status_counts: { all: 1, active: 1, inactive: 0 },
          },
        }),
      );
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
};

export const renderHallScreen = (
  initialRouteName: 'CompanyHalls' | 'HallDetails' | 'HallForm' = 'HallDetails',
  params: RootStackParamList['HallForm'] = {},
) =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="CompanyHalls" component={HallsScreen} />
        <Stack.Screen
          name="HallDetails"
          component={HallDetailsScreen}
          initialParams={{ hallId: 'hall-1' }}
        />
        <Stack.Screen
          name="HallForm"
          component={HallFormScreen}
          initialParams={params}
        />
        <Stack.Screen name="HallBookings" component={HallBookingsScreen} />
        <Stack.Screen name="HallAvailability" component={BlankScreen} />
        <Stack.Screen name="EventDetails" component={BlankScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

export const pressHallButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    const buttons = renderer.root.findAllByProps({ accessibilityLabel: label });
    if (!buttons.length) throw new Error(`Nu există acțiunea ${label}`);
    const action = buttons[0].props.onPress();
    if (label === 'Continuă') await action;
  });
};

export const finishHallSteps = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  await ReactTestRenderer.act(async () => {
    for (const [name, value] of [
      ['minimum_guests', '50'],
      ['address', 'Strada Test 12, Oradea'],
    ])
      renderer.root
        .findAllByType(TextInput)
        .find(field => field.props.testID === `input:${name}`)
        ?.props.onChangeText(value);
  });
  await pressHallButton(renderer, 'Continuă');
  await pressHallButton(renderer, 'Continuă');
};
