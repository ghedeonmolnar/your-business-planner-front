import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { useHall, useHalls } from '@/features/halls/hooks/useHalls';
import { hallFixture } from '@/features/halls/utils/hallTestFixtures';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function HallCounters() {
  const list = useHalls({ search: '', status: 'all' });
  const detail = useHall('hall-1');
  return (
    <Text>{`${list.data?.pages[0].data[0].future_bookings_count}/${detail.data?.future_bookings_count}`}</Text>
  );
}

test('lista si detaliile fara imagini se reinnoiesc cand rezervarile expira', async () => {
  let expired = false;
  jest.useFakeTimers();
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    const hall = {
      ...hallFixture,
      images: [],
      future_bookings_count: expired ? 0 : 1,
      next_bookings: expired ? [] : hallFixture.next_bookings,
    };
    return Promise.resolve(
      path.endsWith('/halls/hall-1')
        ? jsonResponse(200, hall)
        : jsonResponse(200, {
            data: [hall],
            meta: {
              current_page: 1,
              last_page: 1,
              total: 1,
              status_counts: { all: 1, active: 1, inactive: 0 },
            },
          }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<HallCounters />);
  try {
    await ReactTestRenderer.act(async () => {
      await jest.advanceTimersByTimeAsync(100);
    });
    expect(JSON.stringify(renderer.toJSON())).toContain('1/1');
    expired = true;
    await ReactTestRenderer.act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });
    await ReactTestRenderer.act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(JSON.stringify(renderer.toJSON())).toContain('0/0');
  } finally {
    await unmount();
    jest.useRealTimers();
  }
});
