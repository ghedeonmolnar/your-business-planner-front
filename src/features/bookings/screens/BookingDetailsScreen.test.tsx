import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingDetailsScreen } from '@/features/bookings/screens/BookingDetailsScreen';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
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

test('records an advance from the reservation screen with the API mocked', async () => {
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.endsWith('/events/event-1')) {
      return Promise.resolve(jsonResponse(200, plannerBooking));
    }
    if (init?.method === 'POST') {
      const payload = JSON.parse(String(init.body));
      return Promise.resolve(
        jsonResponse(201, {
          id: 'payment-1',
          version: 1,
          event_id: 'event-1',
          ...payload,
          amount: 10000,
        }),
      );
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
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Plăți și cheltuieli' }),
    ).toBeDefined();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Plăți și cheltuieli' })
      .props.onPress();
  });
  await waitForUi(() => {
    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Adaugă încasare sau cheltuială',
      }),
    ).toBeDefined();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Adaugă încasare sau cheltuială' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Sumă (lei)' })
      .props.onChangeText('10000');
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Salvează plata' })
      .props.onPress();
  });
  const requests = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'POST');
  expect(requests).toHaveLength(1);
  expect(String(requests[0][0])).toContain('/events/event-1/payments');
  expect(JSON.parse(String(requests[0][1]?.body))).toMatchObject({
    type: 'incoming',
    category: 'advance',
    amount: '10000',
    status: 'completed',
  });
  expect(renderer.root.findAllByType(BookingPaymentForm)).toHaveLength(0);
  await unmount();
});

test('edits a pending receipt into an expense with a compatible category', async () => {
  const payment = {
    id: 'payment-1',
    version: 1,
    event_id: 'event-1',
    type: 'incoming',
    category: 'advance',
    amount: 100,
    paid_at: '2027-11-13',
    method: 'transfer',
    status: 'pending',
    notes: '',
  };
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.endsWith('/events/event-1')) {
      return Promise.resolve(jsonResponse(200, plannerBooking));
    }
    if (init?.method === 'PUT') {
      return Promise.resolve(
        jsonResponse(200, {
          ...payment,
          ...JSON.parse(String(init.body)),
          amount: 100,
        }),
      );
    }
    if (path.includes('/payments')) {
      return Promise.resolve(paginatedResponse([payment]));
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
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Plăți și cheltuieli' }),
    ).toBeDefined();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Plăți și cheltuieli' })
      .props.onPress();
  });
  await waitForUi(() => {
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Editează plata' }),
    ).toBeDefined();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Editează plata' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    const operation = renderer.root
      .findByType(BookingPaymentForm)
      .findAllByType(SearchableSelect)
      .find(field => field.props.label === 'Operațiune');
    if (!operation) {
      throw new Error('Lipsește selectorul operațiunii.');
    }
    operation.props.onChange(['outgoing']);
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Salvează plata' })
      .props.onPress();
  });
  const requests = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'PUT');
  expect(requests).toHaveLength(1);
  expect(String(requests[0][0])).toContain('/event-payments/payment-1');
  expect(JSON.parse(String(requests[0][1]?.body))).toMatchObject({
    type: 'outgoing',
    category: 'staff',
    amount: '100',
    status: 'pending',
  });
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'POST'),
  ).toBe(false);
  await unmount();
});
