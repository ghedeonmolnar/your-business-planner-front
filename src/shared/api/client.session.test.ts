import { apiRequest } from '@/shared/api/client';
import {
  advanceSessionGeneration,
  setCompanyAccessHandler,
} from '@/shared/api/sessionExpiry';
import { clearAuthToken } from '@/shared/storage/authTokenStorage';
import { jsonResponse } from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  getAuthToken: jest.fn(() => Promise.resolve('current-token')),
  clearAuthToken: jest.fn(() => Promise.resolve()),
}));

afterEach(() => {
  jest.clearAllMocks();
  setCompanyAccessHandler(null);
});

test.each([
  [200, { id: 'old-account-data' }],
  [401, { error: { code: 'UNAUTHENTICATED' } }],
  [403, { error: { code: 'SUBSCRIPTION_INACTIVE' } }],
])(
  'ignores a response from an earlier session with status %i',
  async (status, payload) => {
    const blockCompany = jest.fn();
    setCompanyAccessHandler(blockCompany);
    globalThis.fetch = jest.fn(async () => {
      advanceSessionGeneration();
      return jsonResponse(status, payload);
    });

    await expect(apiRequest('/events')).rejects.toMatchObject({
      reason: 'aborted',
      status: 0,
    });
    expect(clearAuthToken).not.toHaveBeenCalled();
    expect(blockCompany).not.toHaveBeenCalled();
  },
);

test('a public unauthorized response cannot clear an authenticated token', async () => {
  globalThis.fetch = jest.fn(async () => jsonResponse(401, {}));
  await expect(apiRequest('/login', { auth: false })).rejects.toMatchObject({
    status: 401,
  });
  expect(clearAuthToken).not.toHaveBeenCalled();
});

test('a session change during token cleanup does not expire the new account', async () => {
  globalThis.fetch = jest.fn(async () => jsonResponse(401, {}));
  jest.mocked(clearAuthToken).mockImplementationOnce(async () => {
    advanceSessionGeneration();
  });
  await expect(apiRequest('/events')).rejects.toMatchObject({
    reason: 'aborted',
    status: 0,
  });
});
