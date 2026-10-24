import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useHallDay } from '@/features/bookings/hooks/useBookings';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
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

function Probe() {
  const query = useHallDay('2027-11-13');
  return (
    <AppButton
      label={
        query.data?.pages
          .flatMap(page => page.items.map(hall => hall.id))
          .join(',') || 'loading'
      }
      onPress={() => query.fetchNextPage()}
    />
  );
}

test('reia prima pagină a sălilor când revizia se schimbă între pagini', async () => {
  let changed = false;
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.includes('page=2')) {
      expect(path).toContain('snapshot=' + 'a'.repeat(64));
      changed = true;
      return Promise.resolve(
        jsonResponse(409, { error: { code: 'CALENDAR_DAY_LIST_CHANGED' } }),
      );
    }
    return Promise.resolve(
      jsonResponse(200, {
        data: [
          {
            id: changed ? 'current-hall' : 'old-hall',
            name: 'Sală',
            capacity: 100,
            status: 'free',
            booking_id: null,
          },
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
  const { renderer, unmount } = await renderWithProviders(<Probe />);
  try {
    await waitForUi(() =>
      expect(renderer.root.findByType(AppButton).props.label).toBe('old-hall'),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(AppButton).props.onPress();
    });
    await waitForUi(() =>
      expect(renderer.root.findByType(AppButton).props.label).toBe(
        'current-hall',
      ),
    );
  } finally {
    await unmount();
  }
});
