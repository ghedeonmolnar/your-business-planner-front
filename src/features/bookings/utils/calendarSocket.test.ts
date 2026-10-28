import { startCalendarSocket } from '@/features/bookings/utils/calendarSocket';

class Socket {
  static OPEN = 1;
  readyState = 1;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = 3;
    this.onclose?.({ code: 1000 });
  });
  constructor(readonly url: string) {
    sockets.push(this);
  }
  receive(event: string, data: object = {}, channel?: string) {
    this.onmessage?.({
      data: JSON.stringify({ event, channel, data: JSON.stringify(data) }),
    });
  }
}

let sockets: Socket[];
const originalSocket = globalThis.WebSocket;
const configuration = { url: 'wss://socket.example.test', key: 'public-key' };
const channel = 'private-planner-calendar.company-1';
beforeEach(() => {
  jest.useFakeTimers();
  sockets = [];
  globalThis.WebSocket = Socket as unknown as typeof WebSocket;
});
afterEach(() => {
  globalThis.WebSocket = originalSocket;
  jest.useRealTimers();
});

const options = () => ({
  companyId: 'company-1',
  authorize: jest.fn(() => Promise.resolve({ auth: 'signature' })),
  onChanged: jest.fn(),
  onReady: jest.fn(),
  onError: jest.fn(),
});

test('construiește adresa și când pathname este disponibil numai pentru citire în React Native', () => {
  const originalUrl = globalThis.URL;
  globalThis.URL = jest.fn((address: string) => {
    const url = new originalUrl(address);
    const pathname = url.pathname;
    Object.defineProperty(url, 'pathname', { get: () => pathname });
    return url;
  }) as unknown as typeof URL;
  const callbacks = options();
  let stop: (() => void) | undefined;
  try {
    stop = startCalendarSocket(callbacks, configuration);
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(sockets).toHaveLength(1);
    expect(sockets[0].url).toBe(
      'wss://socket.example.test/app/public-key?protocol=7&client=react-native-calendar&version=1.0',
    );
  } finally {
    stop?.();
    globalThis.URL = originalUrl;
  }
});

test('autorizează canalul privat și procesează numai semnalele canalului propriu', async () => {
  const callbacks = options();
  const stop = startCalendarSocket(callbacks, configuration);
  sockets[0].receive('pusher:connection_established', {
    socket_id: '1.2',
    activity_timeout: 30,
  });
  await Promise.resolve();
  expect(callbacks.authorize).toHaveBeenCalledWith(
    '1.2',
    channel,
    expect.any(AbortSignal),
  );
  expect(sockets[0].send).toHaveBeenCalledWith(
    JSON.stringify({
      event: 'pusher:subscribe',
      data: { channel, auth: 'signature' },
    }),
  );
  sockets[0].receive('pusher_internal:subscription_succeeded', {}, channel);
  sockets[0].receive(
    'calendar.changed',
    {},
    'private-planner-calendar.other-company',
  );
  expect(callbacks.onChanged).not.toHaveBeenCalled();
  sockets[0].receive('calendar.changed', {}, channel);
  expect(callbacks.onReady).toHaveBeenCalledTimes(1);
  expect(callbacks.onChanged).toHaveBeenCalledTimes(1);
  stop();
  jest.advanceTimersByTime(60_000);
  expect(sockets).toHaveLength(1);
});

test('răspunde la heartbeat și reconectează cu abonare nouă după pierderea conexiunii', () => {
  const stop = startCalendarSocket(options(), configuration);
  sockets[0].receive('pusher:ping');
  expect(sockets[0].send).toHaveBeenCalledWith(
    JSON.stringify({ event: 'pusher:pong', data: {} }),
  );
  sockets[0].close();
  jest.advanceTimersByTime(1500);
  expect(sockets).toHaveLength(2);
  stop();
});

test('ignoră autorizarea care sosește după oprirea sesiunii', async () => {
  let resolve: (value: { auth: string }) => void = () => undefined;
  const callbacks = options();
  callbacks.authorize = jest.fn(
    () =>
      new Promise<{ auth: string }>(done => {
        resolve = done;
      }),
  );
  const stop = startCalendarSocket(callbacks, configuration);
  sockets[0].receive('pusher:connection_established', { socket_id: '1.2' });
  stop();
  resolve({ auth: 'late-signature' });
  await Promise.resolve();
  expect(sockets[0].send).not.toHaveBeenCalled();
});
