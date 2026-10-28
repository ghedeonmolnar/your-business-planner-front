import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarYear } from '@/features/bookings/components/CalendarYear';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { companyNow } from '@/shared/utils/formatDate';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { renderedText } from '@/shared/test/renderedText';
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

test('compară pozitiv lunile și încarcă istoricul anual doar când este necesar, păstrând filtrul sălii', async () => {
  const year = companyNow().year() + 2;
  const revision = 'a'.repeat(64);
  const requests: string[] = [];
  const totals: Record<string, number> = {
    [`${year}-10`]: 10,
    [`${year}-11`]: 6,
    [`${year}-12`]: 8,
    [`${year - 1}-11`]: 3,
  };
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    requests.push(path);
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision }));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.includes('/calendar/day'))
      return Promise.resolve(
        paginatedResponse([], { snapshot: revision, revision }),
      );
    const requestedYear = Number(path.match(/date_from=(\d{4})-01-01/)?.[1]);
    const first = dayjs(`${requestedYear}-01-01`);
    const days = Array.from(
      { length: first.endOf('year').diff(first, 'day') + 1 },
      (_, index) => {
        const date = first.add(index, 'day');
        const confirmed =
          date.date() <= (totals[date.format('YYYY-MM')] ?? 0) ? 1 : 0;
        return {
          date: date.format('YYYY-MM-DD'),
          confirmed,
          tentative: 0,
          free: 1 - confirmed,
          active_capacity: 1,
          active_occupied_halls: confirmed,
        };
      },
    );
    return Promise.resolve(
      jsonResponse(200, {
        revision,
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days,
      }),
    );
  }) as typeof globalThis.fetch;
  const previousYearRequests = () =>
    requests.filter(path =>
      path.includes(
        `/calendar?date_from=${year - 1}-01-01&date_to=${year - 1}-12-31&hall_id=hall-1`,
      ),
    );
  const { renderer, unmount } = await renderWithProviders(
    <CalendarScreen initialHallId="hall-1" />,
  );
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarMonth).props.onSelect(`${year}-12-15`);
      renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(1);
    });
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain(
        `+33% față de Noiembrie ${year}`,
      ),
    );
    expect(previousYearRequests()).toHaveLength(0);
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarYear).props.onSelect(`${year}-11`);
    });
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain(
        `+100% față de Noiembrie ${year - 1}`,
      ),
    );
    expect(previousYearRequests()).toHaveLength(1);
    expect(renderedText(renderer)).not.toContain('mai puțin');
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarYear).props.onSelect(`${year}-10`);
    });
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain(
        `10 rezervări în plus față de Septembrie ${year}`,
      ),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(CalendarYear).props.onSelect(`${year}-11`);
    });
    expect(renderedText(renderer)).toContain(
      `+100% față de Noiembrie ${year - 1}`,
    );
    expect(previousYearRequests()).toHaveLength(1);
  } finally {
    await unmount();
  }
});
