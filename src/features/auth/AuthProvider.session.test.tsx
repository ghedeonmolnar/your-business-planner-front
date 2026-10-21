import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/shared/storage/authTokenStorage';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { AppState, AppStateStatus } from 'react-native';
import { notifySessionExpired } from '@/shared/api/sessionExpiry';
import {
  employeeAccount,
  flushAsyncWork,
  SessionState,
} from '@/features/auth/utils/authTestFixtures';

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
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('an expired session hides the account before token cleanup finishes', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(200, employeeAccount));
  const { renderer, queryClient, unmount } = await renderWithProviders(
    <SessionState />,
  );
  await flushAsyncWork();
  let finishCleanup: () => void = () => undefined;
  const cleanup = new Promise<void>(resolve => {
    finishCleanup = resolve;
  });
  jest.mocked(clearAuthToken).mockReturnValueOnce(cleanup);

  await ReactTestRenderer.act(async () => {
    notifySessionExpired();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(JSON.stringify(renderer.toJSON())).not.toContain('sesiune activă');
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    finishCleanup();
  });
  await flushAsyncWork();
  await unmount();
});

test('a profile response already in flight cannot restore a signed out account', async () => {
  const listeners: Array<(state: AppStateStatus) => void> = [];
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      listeners.push(listener);
      return { remove: jest.fn() };
    });
  let finishRefresh: (response: Response) => void = () => undefined;
  const refresh = new Promise<Response>(resolve => {
    finishRefresh = resolve;
  });
  globalThis.fetch = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse(200, employeeAccount))
    .mockReturnValueOnce(refresh);
  const { renderer, unmount } = await renderWithProviders(<SessionState />);
  await flushAsyncWork();

  await ReactTestRenderer.act(async () => {
    listeners.forEach(listener => listener('active'));
  });
  await ReactTestRenderer.act(async () => {
    notifySessionExpired();
  });
  await ReactTestRenderer.act(async () => {
    finishRefresh(jsonResponse(200, employeeAccount));
  });
  await flushAsyncWork();

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(JSON.stringify(renderer.toJSON())).not.toContain('sesiune activă');
  await unmount();
});
