import {
  employeeAccount,
  eventReminderIds,
  revokedSession,
  flushAsyncWork,
  SessionState,
} from '@/features/auth/utils/authTestFixtures';
import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import notifee from '@notifee/react-native';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/shared/storage/authTokenStorage';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('stored-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAuthToken).mockResolvedValue('stored-token');
  jest.mocked(clearAuthToken).mockResolvedValue(undefined);
  jest.mocked(setAuthToken).mockResolvedValue(undefined);
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
    ...eventReminderIds,
    'other-notification',
  ]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('startup without a token keeps the private account inaccessible', async () => {
  jest.mocked(getAuthToken).mockResolvedValue(null);
  globalThis.fetch = jest.fn();

  const { renderer, unmount } = await renderWithProviders(<SessionState />);
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(globalThis.fetch).not.toHaveBeenCalled();
  await unmount();
});

test('a token revoked before startup returns to login and clears the local reminders', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(revokedSession()),
  ) as unknown as typeof globalThis.fetch;

  const { renderer, unmount } = await renderWithProviders(<SessionState />);
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(clearAuthToken).toHaveBeenCalled();
  expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith(
    eventReminderIds,
  );
  await unmount();
});

test('returning to the foreground signs out an account blocked in the meantime', async () => {
  const appStateListeners: Array<(state: AppStateStatus) => void> = [];
  const addAppStateListener = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      appStateListeners.push(listener);

      return { remove: jest.fn() };
    });
  let accountBlocked = false;
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      accountBlocked ? revokedSession() : jsonResponse(200, employeeAccount),
    ),
  ) as unknown as typeof globalThis.fetch;

  const { renderer, unmount } = await renderWithProviders(<SessionState />);
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain(
    'sesiune activă: employee',
  );

  accountBlocked = true;
  await ReactTestRenderer.act(async () => {
    appStateListeners.forEach(listener => listener('active'));
  });
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(clearAuthToken).toHaveBeenCalled();
  expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith(
    eventReminderIds,
  );
  await unmount();
  addAppStateListener.mockRestore();
});

test('returning to the foreground without the stored token removes the account', async () => {
  const listeners: Array<(state: AppStateStatus) => void> = [];
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      listeners.push(listener);
      return { remove: jest.fn() };
    });
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(200, employeeAccount));
  const { renderer, unmount } = await renderWithProviders(<SessionState />);
  await flushAsyncWork();
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'sesiune activă: employee',
  );

  jest.mocked(getAuthToken).mockResolvedValue(null);
  await ReactTestRenderer.act(async () => {
    listeners.forEach(listener => listener('active'));
  });
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  expect(clearAuthToken).toHaveBeenCalled();
  await unmount();
});
