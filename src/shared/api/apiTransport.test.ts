import { sendRequest } from '@/shared/api/apiTransport';

beforeEach(() => {
  jest.useFakeTimers();
  globalThis.fetch = jest.fn(
    (_url: Parameters<typeof fetch>[0], init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new Error('aborted')),
        );
      }),
  ) as typeof globalThis.fetch;
});
afterEach(() => {
  jest.useRealTimers();
});

test('o încărcare cu termen explicit continuă după termenul implicit și se oprește la limita proprie', async () => {
  const request = sendRequest(
    'https://api.test/halls',
    { method: 'POST' },
    undefined,
    60_000,
  );
  const rejected = expect(request).rejects.toMatchObject({ reason: 'timeout' });
  await jest.advanceTimersByTimeAsync(20_001);
  expect(jest.mocked(globalThis.fetch).mock.calls[0][1]?.signal?.aborted).toBe(
    false,
  );
  await jest.advanceTimersByTimeAsync(40_000);
  await rejected;
  expect(jest.getTimerCount()).toBe(0);
});

test('anularea externă oprește încărcarea și elimină temporizatorul', async () => {
  const controller = new AbortController();
  const request = sendRequest(
    'https://api.test/halls',
    { method: 'POST' },
    controller.signal,
    60_000,
  );
  const rejected = expect(request).rejects.toMatchObject({ reason: 'aborted' });
  controller.abort();
  await rejected;
  expect(jest.getTimerCount()).toBe(0);
});
