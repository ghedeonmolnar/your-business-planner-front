import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { CalendarHallGroup } from '@/features/bookings/components/CalendarHallGroup';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { companyNow } from '@/shared/utils/formatDate';
import { renderedText } from '@/shared/test/renderedText';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

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

test('refolosește sumarul anual și ziua din cache, verificând separat revizia serverului', async () => {
  let revision = 'a'.repeat(64);
  const requests: string[] = [];
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    requests.push(path);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision }));
    if (path.includes('/calendar/day'))
      return Promise.resolve(
        paginatedResponse([], { snapshot: 'b'.repeat(64), revision }),
      );
    return Promise.resolve(
      jsonResponse(200, {
        revision,
        halls: [{ id: 'hall-1', name: 'Sala test', is_active: true }],
        days: [],
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, queryClient, unmount } = await renderWithProviders(
    <CalendarScreen />,
  );
  const summaryRequests = () =>
    requests.filter(path => path.includes('/calendar?'));
  const dayRequests = () =>
    requests.filter(path => path.includes('/calendar/day?'));
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarMonth)).toHaveLength(1),
    );
    const year = companyNow().year();
    const firstDate = `${year}-05-15`;
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(CalendarMonth).props.onSelect(firstDate),
    );
    await waitForUi(() =>
      expect(
        queryClient.getQueryData(
          queryKeys.planner.directory('company-1', 'hall-day', {
            date: firstDate,
            hall_id: undefined,
          }),
        ),
      ).toBeDefined(),
    );
    const summaries = summaryRequests().length;
    const days = dayRequests().length;
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(CalendarMonth).props.onSelect(`${year}-06-15`),
    );
    await waitForUi(() => expect(dayRequests()).toHaveLength(days + 1));
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(CalendarMonth).props.onSelect(firstDate),
    );
    expect(summaryRequests()).toHaveLength(summaries);
    expect(dayRequests()).toHaveLength(days + 1);
    await ReactTestRenderer.act(async () => {
      await queryClient.refetchQueries({
        queryKey: queryKeys.planner.calendarRevision('company-1'),
      });
    });
    expect(summaryRequests()).toHaveLength(summaries);
    expect(dayRequests()).toHaveLength(days + 1);
    revision = 'c'.repeat(64);
    await ReactTestRenderer.act(async () => {
      await queryClient.refetchQueries({
        queryKey: queryKeys.planner.calendarRevision('company-1'),
      });
    });
    await waitForUi(() =>
      expect(summaryRequests().length).toBeGreaterThan(summaries),
    );
    await waitForUi(() =>
      expect(dayRequests().length).toBeGreaterThan(days + 1),
    );
  } finally {
    await unmount();
  }
});

test('grupează separat sălile libere și ocupate și afișează programul fără sufixul zilei următoare', async () => {
  const revision = 'a'.repeat(64);
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/calendar/revision'))
      return Promise.resolve(jsonResponse(200, { revision }));
    if (path.includes('/calendar/day'))
      return Promise.resolve(
        paginatedResponse(
          [
            {
              id: 'royal',
              name: 'Sala Royal',
              capacity: 500,
              booking_id: 'event-1',
              status: 'confirmed',
              type: 'nunta',
              starts_at: '2026-11-07T14:00:00Z',
              ends_at: '2026-11-08T00:00:00Z',
            },
            {
              id: 'garden',
              name: 'Sala Garden',
              capacity: 150,
              booking_id: null,
              status: 'free',
            },
          ],
          { snapshot: 'b'.repeat(64), revision },
        ),
      );
    return Promise.resolve(
      jsonResponse(200, { revision, halls: [], days: [] }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<CalendarScreen />);
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CalendarHallRow)).toHaveLength(2),
    );
    const groups = renderer.root.findAllByType(CalendarHallGroup);
    expect(groups.map(group => group.props.title)).toEqual([
      'Săli libere',
      'Săli ocupate',
    ]);
    const freeCard = renderer.root
      .findAllByType(CalendarHallRow)
      .find(row => row.props.hall.id === 'garden');
    expect(
      freeCard
        ?.findAllByType(Text)
        .map(node => node.props.children)
        .join(' '),
    ).not.toContain('—');
    expect(renderedText(renderer)).toContain('16:00 – 02:00');
    expect(renderedText(renderer)).not.toContain('(+1 zi)');
  } finally {
    await unmount();
  }
});
