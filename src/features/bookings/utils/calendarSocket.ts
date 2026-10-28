import { CALENDAR_REVERB_APP_KEY, CALENDAR_WEBSOCKET_URL } from '@env';
import {
  calendarSocketEstablishedSchema,
  parseCalendarSocketMessage,
} from '@/features/bookings/utils/calendarSocketMessages';
import { isAllowedApiUrl } from '@/shared/api/apiConfiguration';

type CalendarSocketOptions = {
  companyId: string;
  authorize: (
    socketId: string,
    channelName: string,
    signal: AbortSignal,
  ) => Promise<{ auth: string }>;
  onChanged: () => void;
  onReady: () => void;
  onError: (error: unknown) => void;
};

const CONNECT_TIMEOUT_MS = 15_000;
const MAXIMUM_RECONNECT_DELAY_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;

type CalendarSocketConfiguration = { url?: string; key?: string };

const socketUrl = (configuration: CalendarSocketConfiguration) => {
  if (!configuration.url || !configuration.key) return null;
  const httpAddress = configuration.url.replace(/^ws(s?):/, 'http$1:');
  if (
    !/^wss?:\/\//.test(configuration.url) ||
    !isAllowedApiUrl(httpAddress, __DEV__)
  )
    throw new Error('CALENDAR_SOCKET_INVALID_CONFIGURATION');
  return `${configuration.url.replace(/\/+$/, '')}/app/${encodeURIComponent(configuration.key)}?protocol=7&client=react-native-calendar&version=1.0`;
};

export const startCalendarSocket = (
  options: CalendarSocketOptions,
  configuration: CalendarSocketConfiguration = {
    url: CALENDAR_WEBSOCKET_URL,
    key: CALENDAR_REVERB_APP_KEY,
  },
) => {
  let url: string | null;
  try {
    url = socketUrl(configuration);
  } catch (error) {
    options.onError(error);
    return () => undefined;
  }
  if (!url) return () => undefined;
  const channel = `private-planner-calendar.${options.companyId}`;
  let stopped = false;
  let attempt = 0;
  let socket: WebSocket | undefined;
  let authorization: AbortController | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let activityTimer: ReturnType<typeof setTimeout> | undefined;
  let connectTimer: ReturnType<typeof setTimeout> | undefined;
  let activityTimeout = 30_000;

  const clearTimers = () => {
    clearTimeout(connectTimer);
    clearTimeout(activityTimer);
  };

  const connect = () => {
    if (stopped || !url) return;
    let current: WebSocket;
    try {
      current = new WebSocket(url);
    } catch (error) {
      options.onError(error);
      reconnectTimer = setTimeout(connect, MAXIMUM_RECONNECT_DELAY_MS);
      return;
    }
    socket = current;
    const isCurrent = () => !stopped && socket === current;
    const send = (event: string, data: object = {}) => {
      if (isCurrent() && current.readyState === WebSocket.OPEN)
        current.send(JSON.stringify({ event, data }));
    };
    const activity = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        send('pusher:ping');
        activityTimer = setTimeout(() => current.close(), PONG_TIMEOUT_MS);
      }, activityTimeout);
    };
    connectTimer = setTimeout(() => current.close(), CONNECT_TIMEOUT_MS);
    current.onmessage = event => {
      if (!isCurrent()) return;
      try {
        const message = parseCalendarSocketMessage(event.data);
        activity();
        if (message.event === 'pusher:ping') send('pusher:pong');
        if (message.event === 'pusher:connection_established') {
          const established = calendarSocketEstablishedSchema.parse(
            message.data,
          );
          activityTimeout = (established.activity_timeout ?? 30) * 1000;
          authorization?.abort();
          authorization = new AbortController();
          void options
            .authorize(established.socket_id, channel, authorization.signal)
            .then(result => {
              if (isCurrent())
                send('pusher:subscribe', { channel, auth: result.auth });
            })
            .catch(error => {
              if (isCurrent()) {
                options.onError(error);
                current.close();
              }
            });
        }
        if (message.channel === channel) {
          if (message.event === 'pusher_internal:subscription_succeeded') {
            attempt = 0;
            clearTimeout(connectTimer);
            options.onReady();
          }
          if (message.event === 'calendar.changed') options.onChanged();
        }
        if (message.event === 'pusher:error') {
          options.onError(new Error('CALENDAR_SOCKET_SERVER_ERROR'));
          current.close();
        }
      } catch (error) {
        options.onError(error);
        current.close();
      }
    };
    current.onerror = () => {
      if (isCurrent()) current.close();
    };
    current.onclose = event => {
      if (!isCurrent()) return;
      socket = undefined;
      clearTimers();
      authorization?.abort();
      if (event.code >= 4000 && event.code < 4100) return;
      const delay = Math.min(1000 * 2 ** attempt++, MAXIMUM_RECONNECT_DELAY_MS);
      reconnectTimer = setTimeout(connect, delay + Math.random() * 500);
    };
  };
  connect();

  return () => {
    stopped = true;
    clearTimers();
    clearTimeout(reconnectTimer);
    authorization?.abort();
    socket?.close();
  };
};
