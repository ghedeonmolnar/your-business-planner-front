import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { companyNow } from '@/shared/utils/formatDate';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('calendarul se montează pe date valide și schimbă împreună luna, ziua și filtrul sălii', async () => {
  const localized = jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('21 octombrie 2026');
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.includes('/calendar/day')) {
      return Promise.resolve(
        paginatedResponse([
          {
            id: 'hall-1',
            name: 'Sala test',
            capacity: 100,
            booking_id: null,
            status: 'free',
          },
        ]),
      );
    }
    return Promise.resolve(
      jsonResponse(200, {
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days: [],
      }),
    );
  }) as typeof globalThis.fetch;
  try {
    const { renderer, unmount } = await renderWithProviders(<CalendarScreen />);
    expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1);
    const nextDate = companyNow().add(1, 'month').format('YYYY-MM-DD');
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Perioada următoare' })
        .props.onPress();
    });
    expect(renderer.root.findByType(CalendarMonth).props.month).toBe(
      nextDate.slice(0, 7),
    );
    expect(renderer.root.findByType(CalendarMonth).props.selected).toBe(
      nextDate,
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(SearchableSelect).props.onChange(['hall-1']);
    });
    const calls = jest
      .mocked(globalThis.fetch)
      .mock.calls.map(([url]) => String(url));
    expect(
      calls.some(
        path =>
          path.includes('/calendar/day?') && path.includes('hall_id=hall-1'),
      ),
    ).toBe(true);
    expect(
      calls.some(path =>
        path.includes(
          '/calendar?date_from=' +
            dayjs(nextDate).startOf('month').format('YYYY-MM-DD'),
        ),
      ),
    ).toBe(true);
    expect(calls.every(path => !path.includes('Invalid'))).toBe(true);
    await unmount();
  } finally {
    localized.mockRestore();
  }
});
