import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SectionList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { DashboardMonthHeader } from '@/features/dashboard/components/DashboardMonthHeader';
import { Event } from '@/features/events/types';
import { eventFixture } from '@/shared/test/apiFixtures';
import {
  getVisibleDialog,
  jsonResponse,
  paginatedResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator();

const getRenderedText = (value: unknown): string => {
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
};

const renderDashboard = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen component={DashboardScreen} name="Dashboard" />
      </Stack.Navigator>
    </NavigationContainer>,
  );

const logoutRequests = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([url]) => String(url).includes('/logout'));

beforeEach(() => {
  globalThis.fetch = jest.fn(url => {
    if (String(url).includes('/dashboard-summary')) {
      return Promise.resolve(
        jsonResponse(200, {
          upcoming_events_count: 0,
          projected_balance_due: 0,
          monthly_balance_due: [],
        }),
      );
    }

    return Promise.resolve(paginatedResponse([]));
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('asks for confirmation before signing out', async () => {
  const { renderer, unmount } = await renderDashboard();

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Delogare' })
      .props.onPress();
  });

  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Delogare',
    message: 'Sigur dorești să te deloghezi din aplicație?',
    confirmLabel: 'Da',
    cancelLabel: 'Nu',
  });
  expect(logoutRequests()).toHaveLength(0);

  await pressDialogButton(renderer, 'Da');

  expect(logoutRequests()).toHaveLength(1);
  expect(getVisibleDialog(renderer)).toBeNull();

  await unmount();
});

test('afișează separator doar pentru lunile cu evenimente', async () => {
  jest.useFakeTimers();
  const currentMonthDate = dayjs().endOf('month').format('YYYY-MM-DD');
  const nextMonthDate = dayjs()
    .add(1, 'month')
    .startOf('month')
    .format('YYYY-MM-DD');
  const events: Event[] = [
    {
      id: 'current-month-event',
      client_id: null,
      employee_id: null,
      mascot_id: null,
      date: currentMonthDate,
      start_time: '15:00',
      end_time: '17:00',
      price_per_hour: 300,
      location: 'Oradea',
      type: 'aniversare',
    },
    {
      id: 'next-month-event',
      client_id: null,
      employee_id: null,
      mascot_id: null,
      date: nextMonthDate,
      start_time: '16:00',
      end_time: '18:00',
      price_per_hour: 300,
      location: 'Alesd',
      type: 'aniversare',
    },
  ];

  globalThis.fetch = jest.fn(url => {
    if (String(url).includes('/dashboard-summary')) {
      return Promise.resolve(
        jsonResponse(200, {
          upcoming_events_count: events.length,
          projected_balance_due: 1500.75,
          monthly_balance_due: [
            { month: currentMonthDate.slice(0, 7), balance_due: 900.5 },
            { month: nextMonthDate.slice(0, 7), balance_due: 600.25 },
          ],
        }),
      );
    }

    return Promise.resolve(paginatedResponse(events));
  }) as unknown as typeof globalThis.fetch;

  const { renderer, unmount } = await renderDashboard();
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(100);
  });
  const monthHeaders = renderer.root.findAll(
    node =>
      typeof node.props.testID === 'string' &&
      node.props.testID.startsWith('dashboard-month-'),
  );

  expect([...new Set(monthHeaders.map(node => node.props.testID))]).toEqual([
    `dashboard-month-${currentMonthDate.slice(0, 7)}`,
    `dashboard-month-${nextMonthDate.slice(0, 7)}`,
  ]);
  expect(
    renderer.root
      .findAllByType(DashboardMonthHeader)
      .map(header => header.props.balanceDue),
  ).toEqual([900.5, 600.25]);
  const text = getRenderedText(renderer.toJSON());
  expect(text).toContain('900,5 lei');
  expect(text).toContain('600,25 lei');

  await unmount();
  jest.useRealTimers();
});

test('păstrează soldul lunar complet când evenimentele se încarcă paginat', async () => {
  const date = dayjs().endOf('month').format('YYYY-MM-DD');
  const month = date.slice(0, 7);
  const events = [
    { ...eventFixture, id: 'first-page', date, balance_due: 100 },
    { ...eventFixture, id: 'second-page', date, balance_due: 200 },
  ];
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.includes('/dashboard-summary')) {
      return Promise.resolve(
        jsonResponse(200, {
          upcoming_events_count: 2,
          projected_balance_due: 300,
          monthly_balance_due: [{ month, balance_due: 300 }],
        }),
      );
    }
    const page = path.includes('page=2&') ? 2 : 1;
    return Promise.resolve(
      jsonResponse(200, {
        data: [events[page - 1]],
        meta: { current_page: page, last_page: 2, total: 2 },
      }),
    );
  }) as unknown as typeof globalThis.fetch;

  const { renderer, unmount } = await renderDashboard();
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(renderer.root.findByType(DashboardMonthHeader).props.balanceDue).toBe(
    300,
  );
  expect(
    renderer.root.findByType(SectionList).props.sections[0].data,
  ).toHaveLength(1);

  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(SectionList).props.onEndReached();
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(
    renderer.root.findByType(SectionList).props.sections[0].data,
  ).toHaveLength(2);
  expect(renderer.root.findByType(DashboardMonthHeader).props.balanceDue).toBe(
    300,
  );
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/events-upcoming?page=2&per_page='),
    expect.any(Object),
  );

  await unmount();
});
