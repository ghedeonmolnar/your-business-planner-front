import { apiPaginatedRequest, apiRequest } from '@/shared/api/client';
import { z } from 'zod';
import {
  clearAuthToken,
  getAuthToken,
} from '@/shared/storage/authTokenStorage';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
}));

const mockedGetAuthToken = jest.mocked(getAuthToken);
const mockedClearAuthToken = jest.mocked(clearAuthToken);

const jsonResponse = (status: number, payload: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => 'application/json',
    },
    json: () => Promise.resolve(payload),
    text: () => Promise.resolve(JSON.stringify(payload)),
  }) as unknown as Response;

describe('apiRequest', () => {
  beforeEach(() => {
    mockedGetAuthToken.mockResolvedValue('token-test');
    mockedClearAuthToken.mockResolvedValue(undefined);
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sends bearer token and parses successful JSON responses', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(apiRequest<{ ok: boolean }>('/health')).resolves.toEqual({
      ok: true,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-test',
        }),
      }),
    );
  });

  it('maps a backend error code to the Romanian message', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse(422, { error: { code: 'EVENT_VALIDATION_FAILED' } }),
    );

    await expect(apiRequest('/events')).rejects.toMatchObject({
      message: 'Verifică datele rezervării și încearcă din nou.',
      status: 422,
    });
  });

  it('shows a generic message when the backend sends no known error code', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse(422, {
        message: 'The given data was invalid.',
        errors: { email: ['Email invalid.'] },
      }),
    );

    await expect(apiRequest('/login')).rejects.toMatchObject({
      message: 'Cererea nu a putut fi procesată.',
      status: 422,
    });
  });

  it('clears local token on unauthorized responses', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(401, { message: 'Unauthenticated.' }));

    await expect(apiRequest('/logout')).rejects.toMatchObject({
      status: 401,
    });
    expect(mockedClearAuthToken).toHaveBeenCalledTimes(1);
  });

  it('loads every page from paginated responses', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: '1' }],
          meta: { current_page: 1, last_page: 2 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: '2' }],
          meta: { current_page: 2, last_page: 2 },
        }),
      );

    await expect(
      apiPaginatedRequest<{ id: string }>('/clients', {
        itemSchema: z.object({ id: z.string() }),
      }),
    ).resolves.toEqual([{ id: '1' }, { id: '2' }]);

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/clients?page=1&per_page=100'),
      expect.any(Object),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/clients?page=2&per_page=100'),
      expect.any(Object),
    );
  });

  it('rejects a successful response that violates its schema', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(200, { id: 123 }));

    await expect(
      apiRequest('/client', {
        schema: z.object({ id: z.string() }),
      }),
    ).rejects.toMatchObject({ reason: 'invalid_response' });
  });
});
