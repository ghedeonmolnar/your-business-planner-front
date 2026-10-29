import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SectionList } from 'react-native';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';
import { AgendaScreen } from '@/features/company/screens/AgendaScreen';
import { AgendaBookingCard } from '@/features/company/components/AgendaBookingCard';
import { AgendaMonthHeader } from '@/features/company/components/AgendaMonthHeader';
import { MetaPill } from '@/shared/components/MetaPill';
import { agendaSummaryFixture } from '@/features/company/utils/agendaTestFixtures';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => true,
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('agenda cere date valide când motorul returnează text localizat incompatibil', async () => {
  const localized = jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('21 octombrie 2026');
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, { ...plannerAccount, features: [] })
        : String(url).endsWith('/agenda/summary')
          ? jsonResponse(200, {
              ...agendaSummaryFixture,
              received_amount: null,
              due_amount: null,
              due_count: null,
            })
          : paginatedResponse([plannerBooking]),
    ),
  ) as typeof globalThis.fetch;
  try {
    const { renderer, unmount } = await renderWithProviders(<AgendaScreen />);
    const calls = jest
      .mocked(globalThis.fetch)
      .mock.calls.map(([url]) => String(url));
    expect(calls.some(url => url.includes('/events?agenda=upcoming'))).toBe(
      true,
    );
    expect(calls.every(url => !url.includes('Invalid'))).toBe(true);
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain(plannerBooking.client_name),
    );
    await unmount();
  } finally {
    localized.mockRestore();
  }
});

const upcomingBookings = [
  plannerBooking,
  {
    ...plannerBooking,
    id: 'event-2',
    client_name: 'Maria Popescu',
  },
  {
    ...plannerBooking,
    id: 'event-3',
    client_name: 'Andrei Ionescu',
    date: '2027-11-14',
    starts_at: '2027-11-14T16:00:00Z',
    ends_at: '2027-11-15T02:00:00Z',
  },
  {
    ...plannerBooking,
    id: 'event-4',
    client_name: 'Ioana Popescu',
    date: '2027-12-04',
    starts_at: '2027-12-04T16:00:00Z',
    ends_at: '2027-12-05T02:00:00Z',
  },
];

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });
};

test('agenda evidențiază prima zi cu o singură etichetă de grup, restrânge lunile și deschide destinațiile', async () => {
  mockNavigate.mockClear();
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, { ...plannerAccount, features: [] })
        : String(url).endsWith('/agenda/summary')
          ? jsonResponse(200, {
              ...agendaSummaryFixture,
              received_amount: null,
              due_amount: null,
              due_count: null,
            })
          : paginatedResponse(upcomingBookings),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AgendaScreen />);
  await waitForUi(() =>
    expect(renderer.root.findAllByType(AgendaMonthHeader)).toHaveLength(2),
  );

  const featured = renderer.root
    .findAllByType(AgendaBookingCard)
    .filter(card => card.props.featured);
  expect(featured.map(card => card.props.booking.id)).toEqual([
    plannerBooking.id,
    'event-2',
  ]);
  expect(
    renderer.root
      .findAllByType(MetaPill)
      .filter(pill => pill.props.label === 'Urmează'),
  ).toHaveLength(1);
  expect(
    featured.every(card =>
      card
        .findAllByType(MetaPill)
        .every(pill => pill.props.label !== 'Urmează'),
    ),
  ).toBe(true);
  expect(
    renderer.root
      .findByType(SectionList)
      .props.sections[1].data.map((booking: { id: string }) => booking.id),
  ).toEqual(['event-3']);
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) => String(url).includes('/overview')),
  ).toBe(false);

  await press(renderer, 'Noiembrie 2027, 1 eveniment');
  expect(renderer.root.findByType(SectionList).props.sections[1].data).toEqual(
    [],
  );
  expect(renderer.root.findAllByType(AgendaMonthHeader)[0].props.expanded).toBe(
    false,
  );
  await press(renderer, 'Noiembrie 2027, 1 eveniment');
  expect(
    renderer.root.findByType(SectionList).props.sections[1].data,
  ).toHaveLength(1);

  await press(renderer, 'Vezi calendarul');
  expect(mockNavigate).toHaveBeenCalledWith('Calendar');
  await press(
    renderer,
    `Deschide rezervarea pentru ${plannerBooking.client_name}`,
  );
  expect(mockNavigate).toHaveBeenCalledWith('EventDetails', {
    eventId: plannerBooking.id,
  });
  await press(renderer, 'Notificări');
  expect(renderedText(renderer)).toContain(
    'Mementourile pentru evenimente nu sunt incluse',
  );
  await unmount();
});
