import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarYear } from '@/features/bookings/components/CalendarYear';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { companyNow } from '@/shared/utils/formatDate';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { waitForUi } from '@/shared/test/waitForUi';
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

test('vederea anuală selectează luna, ajustează ziua și păstrează filtrul sălii', async () => {
  const year = companyNow().year();
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision: 'a'.repeat(64) }));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.includes('/calendar/day'))
      return Promise.resolve(
        paginatedResponse([], {
          snapshot: 'a'.repeat(64),
          revision: 'a'.repeat(64),
        }),
      );
    const first =
      path.match(/date_from=(\d{4}-\d{2}-\d{2})/)?.[1] ?? `${year}-01-01`;
    const last =
      path.match(/date_to=(\d{4}-\d{2}-\d{2})/)?.[1] ?? `${year}-12-31`;
    const days = Array.from(
      { length: dayjs(last).diff(dayjs(first), 'day') + 1 },
      (_, index) => ({
        date: dayjs(first).add(index, 'day').format('YYYY-MM-DD'),
        confirmed: 0,
        tentative: 0,
        free: 1,
      }),
    );
    return Promise.resolve(
      jsonResponse(200, {
        revision: 'a'.repeat(64),
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days,
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<CalendarScreen />);
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarMonth).props.onSelect(`${year}-01-31`);
      renderer.root.findByType(SearchableSelect).props.onChange(['hall-1']);
      renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(1);
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarYear)).toHaveLength(1),
    );
    expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(0);
    expect(renderer.root.findAllByType(CalendarLegend)).toHaveLength(0);
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarYear).props.onSelect(`${year}-02`);
    });
    expect(renderer.root.findByType(CalendarYear).props.selectedMonth).toBe(
      `${year}-02`,
    );
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Vezi luna' })
        .props.onPress();
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    expect(renderer.root.findByType(CalendarMonth).props.selected).toBe(
      `${year}-02-${dayjs(`${year}-02-01`).daysInMonth()}`,
    );
    expect(renderer.root.findAllByType(CalendarLegend)).toHaveLength(1);
    expect(
      renderer.root.findByType(SearchableSelect).props.selectedValues,
    ).toEqual(['hall-1']);
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([url]) =>
          String(url).includes(
            `date_from=${year}-01-01&date_to=${year}-12-31&hall_id=hall-1`,
          ),
        ),
    ).toBe(true);
  } finally {
    await unmount();
  }
});
