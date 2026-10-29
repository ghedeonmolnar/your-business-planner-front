import { AppState, AppStateStatus } from 'react-native';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { getCalendarRevisionApi } from '@/features/bookings/api/bookingsApi';
import { startCalendarSocket } from '@/features/bookings/utils/calendarSocket';
import { acquireCalendarSynchronization } from '@/features/bookings/utils/calendarSynchronization';

jest.mock('@/features/bookings/api/bookingsApi', () => ({
  getCalendarRevisionApi: jest.fn(),
}));
jest.mock('@/features/bookings/utils/calendarSocket', () => ({
  startCalendarSocket: jest.fn(() => jest.fn()),
}));

let changeState: (state: AppStateStatus) => void;
let client: QueryClient;
const originalState = AppState.currentState;
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  AppState.currentState = 'active';
  onlineManager.setOnline(true);
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_event, callback) => {
      changeState = callback as (state: AppStateStatus) => void;
      return { remove: jest.fn() };
    });
  jest
    .mocked(getCalendarRevisionApi)
    .mockResolvedValue({
      revision: 'a'.repeat(64),
      availability_revision: 'a'.repeat(64),
    });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  client.clear();
  AppState.currentState = originalState;
  onlineManager.setOnline(true);
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('două calendare împart conexiunea și verificarea, iar semnalele apropiate sunt grupate', async () => {
  const first = acquireCalendarSynchronization(client, 'company-1');
  const second = acquireCalendarSynchronization(client, 'company-1');
  await jest.advanceTimersByTimeAsync(0);
  expect(startCalendarSocket).toHaveBeenCalledTimes(1);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(1);
  const signal = jest.mocked(startCalendarSocket).mock.calls[0][0].onChanged;
  signal();
  signal();
  signal();
  await jest.advanceTimersByTimeAsync(200);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(2);
  first();
  await jest.advanceTimersByTimeAsync(30_000);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(3);
  second();
  await jest.advanceTimersByTimeAsync(30_000);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(3);
});

test('oprește verificările în fundal și fără conexiune, apoi recuperează actualizările la revenire', async () => {
  const stop = acquireCalendarSynchronization(client, 'company-1');
  await jest.advanceTimersByTimeAsync(0);
  AppState.currentState = 'background';
  changeState('background');
  await jest.advanceTimersByTimeAsync(60_000);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(1);
  AppState.currentState = 'active';
  changeState('active');
  await jest.advanceTimersByTimeAsync(0);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(2);
  onlineManager.setOnline(false);
  await jest.advanceTimersByTimeAsync(60_000);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(2);
  onlineManager.setOnline(true);
  await jest.advanceTimersByTimeAsync(0);
  expect(getCalendarRevisionApi).toHaveBeenCalledTimes(3);
  stop();
});
