import React from 'react';
import RootNavigator from '@/app/navigation/RootNavigator';
import HomeTabs from '@/app/navigation/HomeTabs';
import { SubscriptionBlockedScreen } from '@/features/company/screens/SubscriptionBlockedScreen';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
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

test('employee opens the shared navigation and requests only their visible bookings', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, {
            ...plannerAccount,
            role: 'employee',
            employee_id: 'staff-1',
          })
        : paginatedResponse([]),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<RootNavigator />);
  expect(renderer.root.findAllByType(HomeTabs)).toHaveLength(1);
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) => String(url).includes('/overview')),
  ).toBe(false);
  await unmount();
});

test('expired subscription renders only the access screen', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      jsonResponse(200, {
        ...plannerAccount,
        subscription: {
          active: false,
          ends_at: '2020-01-01T00:00:00Z',
          suspended: false,
        },
      }),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<RootNavigator />);
  expect(renderer.root.findAllByType(SubscriptionBlockedScreen)).toHaveLength(
    1,
  );
  expect(renderer.root.findAllByType(HomeTabs)).toHaveLength(0);
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.every(([url]) => String(url).endsWith('/me')),
  ).toBe(true);
  await unmount();
});
