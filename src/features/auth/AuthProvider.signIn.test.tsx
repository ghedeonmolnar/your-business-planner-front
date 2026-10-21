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
import {
  employeeAccount,
  flushAsyncWork,
  SessionControls,
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

test('a token write already in progress is cleared before sign out finishes', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(200, employeeAccount));
  const { renderer, unmount } = await renderWithProviders(<SessionControls />);
  await flushAsyncWork();
  let finishWrite: () => void = () => undefined;
  const tokenWrite = new Promise<void>(resolve => {
    finishWrite = resolve;
  });
  jest.mocked(setAuthToken).mockReturnValueOnce(tokenWrite);
  let signIn: Promise<void> | undefined;
  let signOut: Promise<void> | undefined;

  await ReactTestRenderer.act(async () => {
    signIn = renderer.root
      .findByProps({ accessibilityLabel: 'Conectare' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    signOut = renderer.root
      .findByProps({ accessibilityLabel: 'Deconectare' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  expect(clearAuthToken).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    finishWrite();
    await Promise.all([signIn, signOut]);
  });

  expect(clearAuthToken).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');
  await unmount();
});

test('a new login waits for the previous token cleanup before opening the account', async () => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(200, employeeAccount));
  const { renderer, unmount } = await renderWithProviders(<SessionControls />);
  await flushAsyncWork();
  let finishCleanup: () => void = () => undefined;
  const cleanup = new Promise<void>(resolve => {
    finishCleanup = resolve;
  });
  jest.mocked(clearAuthToken).mockReturnValueOnce(cleanup);
  let signOut: Promise<void> | undefined;
  let signIn: Promise<void> | undefined;

  await ReactTestRenderer.act(async () => {
    signOut = renderer.root
      .findByProps({ accessibilityLabel: 'Deconectare' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    signIn = renderer.root
      .findByProps({ accessibilityLabel: 'Conectare' })
      .props.onPress();
  });

  expect(setAuthToken).not.toHaveBeenCalled();
  expect(JSON.stringify(renderer.toJSON())).toContain('fără sesiune');

  await ReactTestRenderer.act(async () => {
    finishCleanup();
    await Promise.all([signOut, signIn]);
  });

  expect(setAuthToken).toHaveBeenCalledWith('next-token');
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'sesiune activă: employee',
  );
  await unmount();
});
