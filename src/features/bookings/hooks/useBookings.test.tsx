import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useBookings } from '@/features/bookings/hooks/useBookings';
import { AppButton } from '@/shared/components/AppButton';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function BookingsProbe() {
  const query = useBookings();
  return (
    <AppButton
      label={
        query.data?.pages
          .flatMap(page => page.items.map(item => item.id))
          .join(',') || 'loading'
      }
      onPress={() => query.fetchNextPage()}
    />
  );
}

test('reîncepe lista la schimbarea amprentei fără a concatena pagini incompatibile', async () => {
  let changed = false;
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (/(?:[?&])page=2(?:&|$)/.test(path)) {
      expect(path).toContain('snapshot=' + 'a'.repeat(64));
      changed = true;
      return Promise.resolve(
        jsonResponse(409, { error: { code: 'BOOKING_LIST_CHANGED' } }),
      );
    }
    return Promise.resolve(
      jsonResponse(200, {
        data: [
          { ...plannerBooking, id: changed ? 'current-event' : 'old-event' },
        ],
        meta: {
          current_page: 1,
          last_page: 2,
          total: 2,
          snapshot: (changed ? 'b' : 'a').repeat(64),
        },
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<BookingsProbe />);
  await waitForUi(() =>
    expect(renderer.root.findByType(AppButton).props.label).toBe('old-event'),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(AppButton).props.onPress();
  });
  await waitForUi(() =>
    expect(renderer.root.findByType(AppButton).props.label).toBe(
      'current-event',
    ),
  );
  await unmount();
});
