import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmployeeEventsScreen } from '@/features/employeeWorkspace/screens/EmployeeEventsScreen';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { jsonResponse, paginatedResponse, renderWithProviders } from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('employee-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator();

beforeEach(() => {
  const events = [{
    id: 'event-1',
    date: dayjs().format('YYYY-MM-DD'),
    start_time: '14:00',
    end_time: '15:00',
    duration_minutes: 60,
    location: 'Oradea',
    address: 'Strada Test 1',
    type: 'aniversare',
    type_label: 'Aniversare',
    status: 'confirmed',
    status_label: 'Rezervat',
    client_name: 'Client Test',
    contact_phone: '0712345678',
    mascot: { id: 'mascot-1', name: 'Minnie' },
    coworkers: [],
    earnings: null,
    projected_earnings: 100,
  }];
  globalThis.fetch = jest.fn(url => String(url).endsWith('/me')
    ? Promise.resolve(jsonResponse(200, {
      id: 'user-1', name: 'Animator', email: 'animator@example.com',
      role: 'employee', employee_id: 'employee-1',
    }))
    : Promise.resolve(paginatedResponse(events))) as unknown as typeof globalThis.fetch;
});

test('loads assigned events in the calendar and requests past events from the list filter', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Evenimente" component={EmployeeEventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

  expect(JSON.stringify(renderer.toJSON())).toContain('Client Test');
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/me/events?date_from='),
    expect.any(Object),
  );

  await ReactTestRenderer.act(async () => {
    renderer.root.findAllByType(AppSegmentedControl)[0].props.onChangeIndex(1);
  });
  await ReactTestRenderer.act(async () => {
    renderer.root.findAllByType(AppSegmentedControl)[1].props.onChangeIndex(1);
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('timeframe=past'),
    expect.any(Object),
  );
  await unmount();
});
