import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { EmployeeAgendaScreen } from '@/features/employeeWorkspace/screens/EmployeeAgendaScreen';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import {
  getVisibleDialog,
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('employee-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

const Stack = createNativeStackNavigator();

function EventDetailsPlaceholder() {
  return <Text>Detalii deschise</Text>;
}

test('shows the employee summary and upcoming events by month and opens event details', async () => {
  const firstMonth = dayjs();
  const secondMonth = dayjs().add(1, 'month').startOf('month');
  const events: EmployeeEvent[] = [firstMonth, secondMonth].map(
    (date, index) => ({
      id: `event-${index + 1}`,
      date: date.format('YYYY-MM-DD'),
      start_time: '15:00',
      end_time: '18:00',
      duration_minutes: 180,
      location: index === 0 ? 'Tinca' : 'Oradea',
      address: 'Sala mica',
      type: 'aniversare',
      type_label: 'Aniversare',
      status: 'confirmed',
      status_label: 'Rezervat',
      client_name: 'Client Test',
      contact_phone: '0712345678',
      mascot: { id: 'mascot-1', name: 'Minnie' },
      coworkers: [],
      earnings: null,
      projected_earnings: index === 0 ? 100 : 50,
      amount_to_collect: index === 0 ? 600 : null,
    }),
  );

  globalThis.fetch = jest.fn(url => {
    const path = String(url);

    if (path.endsWith('/me')) {
      return Promise.resolve(
        jsonResponse(200, {
          id: 'user-1',
          name: 'Animator',
          email: 'animator@example.com',
          role: 'employee',
          employee_id: 'employee-1',
        }),
      );
    }

    if (path.includes('/me/agenda-summary')) {
      return Promise.resolve(
        jsonResponse(200, {
          upcoming_events_count: 2,
          projected_earnings: 150,
        }),
      );
    }

    return Promise.resolve(paginatedResponse(events));
  }) as unknown as typeof globalThis.fetch;

  const { renderer, unmount } = await renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Agenda" component={EmployeeAgendaScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsPlaceholder} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

  const screen = getRenderedText(renderer.toJSON());
  expect(screen).toContain('150 lei');
  expect(screen).toContain('programate');
  expect(screen).toContain('câștig estimat');
  expect(screen).toContain('Câștig: 100 lei');
  expect(screen).toContain('De încasat: 600 lei');
  expect(screen).toContain('Câștig: 50 lei');
  expect(screen).toContain('Luna curentă -');
  expect(screen).toContain('Tinca');
  expect(screen).toContain('Oradea');
  expect(screen).toContain('Minnie');
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/me/agenda?page=1&per_page='),
    expect.any(Object),
  );

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Delogare' })
      .props.onPress();
  });
  expect(getVisibleDialog(renderer)?.title).toBe('Delogare');

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Detalii eveniment Tinca' })
      .props.onPress();
  });
  expect(getRenderedText(renderer.toJSON())).toContain('Detalii deschise');

  await unmount();
});
