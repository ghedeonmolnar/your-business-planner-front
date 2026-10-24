import React from 'react';
import { renderedText } from '@/shared/test/renderedText';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerHistoryScreen } from '@/features/company/screens/CustomerHistoryScreen';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { BookingCard } from '@/features/bookings/components/BookingCard';
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

test('istoricul păstrează editarea profilului după compactarea cardurilor', async () => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    return Promise.resolve(
      path.endsWith('/clients/client-1')
        ? jsonResponse(200, {
            id: 'client-1',
            version: 1,
            name: 'Ana',
            phone: '0720000011',
            notes: 'Observații client',
          })
        : paginatedResponse([]),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CustomerHistory"
          component={CustomerHistoryScreen}
          initialParams={{ clientId: 'client-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
  await waitForUi(() =>
    expect(renderedText(renderer)).toContain('Observații client'),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Editează clientul' })
      .props.onPress();
  });
  const form = renderer.root.findByType(DirectoryForm);
  expect(form.findByProps({ accessibilityLabel: 'Nume' }).props.value).toBe(
    'Ana',
  );
  expect(form.findByProps({ accessibilityLabel: 'Telefon' }).props.value).toBe(
    '0720000011',
  );
  await unmount();
});

test('istoricul afișează tipul rezervării din catalog în cardul comun', async () => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(
        jsonResponse(200, {
          ...catalogsFixture,
          event_types: [
            { id: plannerBooking.type, name: 'Nuntă personalizată' },
          ],
        }),
      );
    if (path.endsWith('/clients/client-1'))
      return Promise.resolve(
        jsonResponse(200, {
          id: 'client-1',
          version: 1,
          name: 'Ana',
          phone: null,
          notes: null,
        }),
      );
    return Promise.resolve(paginatedResponse([plannerBooking]));
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CustomerHistory"
          component={CustomerHistoryScreen}
          initialParams={{ clientId: 'client-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
  try {
    await waitForUi(() =>
      expect(renderer.root.findByType(BookingCard).props.eventType).toBe(
        'Nuntă personalizată',
      ),
    );
    expect(renderedText(renderer)).toContain('Nuntă personalizată');
    expect(renderer.root.findByType(BookingCard).props.booking.id).toBe(
      plannerBooking.id,
    );
  } finally {
    await unmount();
  }
});
