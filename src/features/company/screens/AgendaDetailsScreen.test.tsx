import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AgendaDetailsScreen } from '@/features/company/screens/AgendaDetailsScreen';
import { AgendaDetailCard } from '@/features/company/components/AgendaDetailCard';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { agendaItemFixture } from '@/features/company/utils/agendaTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('problemele păstrează ordinea serverului, se paginează și deschid rezervarea asociată', async () => {
  const navigate = jest.fn();
  globalThis.fetch = jest.fn(url => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(
        jsonResponse(200, { ...plannerAccount, features: ['finance'] }),
      );
    const secondPage = String(url).includes('page=2');
    return Promise.resolve(
      jsonResponse(200, {
        data: [
          secondPage
            ? {
                ...agendaItemFixture,
                id: 'event-2',
                event_id: 'event-2',
                kind: 'menus',
                amount: null,
                category: null,
                client_name: 'Andrei Diaconu',
              }
            : agendaItemFixture,
        ],
        meta: { current_page: secondPage ? 2 : 1, last_page: 2, total: 2 },
      }),
    );
  }) as typeof globalThis.fetch;
  type Props = React.ComponentProps<typeof AgendaDetailsScreen>;
  const { renderer, unmount } = await renderWithProviders(
    <AgendaDetailsScreen
      route={{
        key: 'agenda',
        name: 'AgendaDetails',
        params: { view: 'attention', month: '2026-10' },
      }}
      navigation={
        { navigate, goBack: jest.fn() } as unknown as Props['navigation']
      }
    />,
  );
  await waitForUi(() =>
    expect(renderer.root.findAllByType(AgendaDetailCard)).toHaveLength(1),
  );
  expect(renderedText(renderer)).toContain('Maria Popescu');
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(PaginationFooter).props.onLoadMore(),
  );
  await waitForUi(() =>
    expect(renderer.root.findAllByType(AgendaDetailCard)).toHaveLength(2),
  );
  const cards = renderer.root.findAllByType(AgendaDetailCard);
  expect(cards.map(card => card.props.item.client_name)).toEqual([
    'Maria Popescu',
    'Andrei Diaconu',
  ]);
  await ReactTestRenderer.act(async () => cards[1].props.onOpen());
  expect(navigate).toHaveBeenLastCalledWith('EventDetails', {
    eventId: 'event-2',
  });
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) =>
        String(url).includes('/agenda/items?view=attention&month=2026-10'),
      ),
  ).toBe(true);
  await unmount();
});
