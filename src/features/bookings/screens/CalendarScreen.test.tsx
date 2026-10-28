import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { waitForUi } from '@/shared/test/waitForUi';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { companyNow } from '@/shared/utils/formatDate';
import { renderedText } from '@/shared/test/renderedText';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: () => true,
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('numără sălile libere din lista afișată chiar dacă sumarul lunar este diferit', async () => {
  let refreshFailed = false;
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision: 'a'.repeat(64) }));
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.includes('/calendar/day'))
      return Promise.resolve(
        paginatedResponse(
          [
            {
              id: 'hall-1',
              name: 'Sala ocupată',
              capacity: 100,
              booking_id: refreshFailed ? null : 'event-1',
              status: refreshFailed ? 'free' : 'confirmed',
            },
          ],
          { snapshot: 'a'.repeat(64), revision: 'a'.repeat(64) },
        ),
      );
    if (refreshFailed)
      return Promise.resolve(
        jsonResponse(503, { error: { code: 'SERVER_ERROR' } }),
      );
    return Promise.resolve(
      jsonResponse(200, {
        revision: 'a'.repeat(64),
        halls: [{ id: 'hall-1', name: 'Sala ocupată', is_active: true }],
        days: [
          {
            date: companyNow().format('YYYY-MM-DD'),
            confirmed: 0,
            tentative: 0,
            free: 99,
          },
        ],
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, queryClient, unmount } = await renderWithProviders(
    <CalendarScreen />,
  );
  try {
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Sala ocupată'),
    );
    expect(renderedText(renderer)).toMatch(/Săli libere\s*·\s*0/);
    expect(renderedText(renderer)).not.toContain('Ultima actualizare:');
    refreshFailed = true;
    await ReactTestRenderer.act(async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.planner.all('company-1'),
      });
    });
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Date vechi'),
    );
    expect(renderedText(renderer)).toMatch(/Săli libere\s*·\s*1/);
  } finally {
    await unmount();
  }
});

test('calendarul se montează pe date valide și schimbă împreună luna, ziua și filtrul sălii', async () => {
  const localized = jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('21 octombrie 2026');
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision: 'a'.repeat(64) }));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.includes('/calendar/day')) {
      return Promise.resolve(
        paginatedResponse(
          [
            {
              id: 'hall-1',
              name: 'Sala test',
              capacity: 100,
              booking_id: null,
              status: 'free',
            },
          ],
          { snapshot: 'a'.repeat(64), revision: 'a'.repeat(64) },
        ),
      );
    }
    return Promise.resolve(
      jsonResponse(200, {
        revision: 'a'.repeat(64),
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days: [],
      }),
    );
  }) as typeof globalThis.fetch;
  try {
    const { renderer, unmount } = await renderWithProviders(<CalendarScreen />);
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    const nextDate = companyNow().add(1, 'month').format('YYYY-MM-DD');
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Perioada următoare' })
        .props.onPress();
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    expect(renderer.root.findByType(CalendarMonth).props.month).toBe(
      nextDate.slice(0, 7),
    );
    expect(renderer.root.findByType(CalendarMonth).props.selected).toBe(
      nextDate,
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(SearchableSelect).props.onChange(['hall-1']);
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
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
            dayjs(nextDate).startOf('year').format('YYYY-MM-DD'),
        ),
      ),
    ).toBe(true);
    expect(calls.every(path => !path.includes('Invalid'))).toBe(true);
    await unmount();
  } finally {
    localized.mockRestore();
  }
});
