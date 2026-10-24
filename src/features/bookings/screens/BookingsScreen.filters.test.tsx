import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SectionList } from 'react-native';
import { BookingsScreen } from '@/features/bookings/screens/BookingsScreen';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { BookingAdvancedFilters } from '@/features/bookings/components/BookingAdvancedFilters';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { SearchField } from '@/shared/components/SearchField';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const mockRequests = (
  bookings: (path: string) => Response | Promise<Response>,
) => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.includes('/halls'))
      return Promise.resolve(
        paginatedResponse([
          { id: 'hall-1', name: 'Sala Imperial' },
          { id: 'hall-2', name: 'Sala Garden' },
        ]),
      );
    if (path.includes('/catalogs'))
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [{ id: 'nunta', name: 'Nuntă' }],
          client_sources: [],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [],
        }),
      );
    return Promise.resolve(bookings(path));
  }) as typeof globalThis.fetch;
};
const select = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await ReactTestRenderer.act(async () => {
    const field = renderer.root
      .findAllByType(SearchableSelect)
      .find(item => item.props.label === label);
    if (!field) throw new Error('Lipsește selectorul ' + label);
    field.props.onChange([value]);
  });
};
const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () =>
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress(),
  );
};
const eventRequests = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.map(([url]) => String(url))
    .filter(url => url.includes('/events?'));

test('starts with upcoming dates ascending and uses server totals for partially loaded months', async () => {
  mockRequests(() =>
    jsonResponse(200, {
      data: [plannerBooking],
      meta: {
        current_page: 1,
        last_page: 3,
        total: 45,
        months: [{ month: '2027-11', total: 45 }],
      },
    }),
  );
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  expect(eventRequests().at(-1)).toContain('timeframe=upcoming');
  expect(eventRequests().at(-1)).toContain('sort=date_asc');
  expect(renderer.root.findByType(SectionList).props.sections[0]).toMatchObject(
    { key: '2027-11', total: 45, data: [plannerBooking] },
  );
  await unmount();
});

test('clears old results on status and hall changes and ignores a late response from earlier filters', async () => {
  let finishOld: ((response: Response) => void) | undefined;
  const oldRequest = new Promise<Response>(resolve => {
    finishOld = resolve;
  });
  mockRequests(path =>
    path.includes('hall_id=hall-2')
      ? paginatedResponse([])
      : path.includes('status=confirmed')
        ? oldRequest
        : paginatedResponse([plannerBooking]),
  );
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  expect(renderer.root.findAllByType(BookingCard)).toHaveLength(1);
  await select(renderer, 'Starea rezervării', 'confirmed');
  expect(renderer.root.findAllByType(BookingCard)).toHaveLength(0);
  await select(renderer, 'Sală de evenimente', 'hall-2');
  await ReactTestRenderer.act(async () =>
    finishOld?.(paginatedResponse([plannerBooking])),
  );
  expect(eventRequests().at(-1)).toContain('status=confirmed');
  expect(eventRequests().at(-1)).toContain('hall_id=hall-2');
  expect(renderer.root.findAllByType(BookingCard)).toHaveLength(0);
  expect(renderer.root.findByType(EmptyState).props.title).toBe(
    'Nu există rezervări pentru criteriile selectate',
  );
  await unmount();
});

test('switches automatic sorting with timeframe but retains manual sorting until reset', async () => {
  mockRequests(() => paginatedResponse([]));
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(2),
  );
  expect(eventRequests().at(-1)).toContain('sort=date_desc');
  await select(renderer, 'Sortează rezervările', 'date_asc');
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(0),
  );
  expect(eventRequests().at(-1)).toContain('timeframe=all');
  expect(eventRequests().at(-1)).toContain('sort=date_asc');
  await press(renderer, 'Resetează filtrele');
  expect(
    renderer.root.findByType(AppSegmentedControl).props.selectedIndex,
  ).toBe(1);
  expect(
    renderer.root
      .findAllByType(SearchableSelect)
      .find(item => item.props.label === 'Sortează rezervările')?.props
      .selectedValues,
  ).toEqual(['date_asc']);
  await unmount();
});

test('clears the visible results while search is debouncing and sends the search to the server', async () => {
  mockRequests(path =>
    path.includes('search=')
      ? paginatedResponse([])
      : paginatedResponse([plannerBooking]),
  );
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  jest.useFakeTimers();
  try {
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(SearchField).props.onChange('Popescu'),
    );
    expect(renderer.root.findAllByType(BookingCard)).toHaveLength(0);
    await ReactTestRenderer.act(async () => jest.advanceTimersByTime(350));
    expect(eventRequests().at(-1)).toContain('search=Popescu');
    expect(eventRequests().at(-1)).toContain('timeframe=upcoming');
  } finally {
    jest.useRealTimers();
    await unmount();
  }
});

test('applies advanced values together with the quick filters and discards unapplied drafts', async () => {
  mockRequests(() => paginatedResponse([]));
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  await select(renderer, 'Starea rezervării', 'confirmed');
  await select(renderer, 'Sală de evenimente', 'hall-1');
  await press(renderer, 'Filtre avansate');
  await ReactTestRenderer.act(async () => {
    const dates = renderer.root.findAllByType(DatePickerField);
    dates
      .find(date => date.props.label === 'De la')
      ?.props.onChange('2027-11-01');
    dates
      .find(date => date.props.label === 'Până la')
      ?.props.onChange('2027-12-31');
  });
  await select(renderer, 'Tipul evenimentului', 'nunta');
  await select(renderer, 'Starea plății', 'partial');
  const beforeApply = eventRequests().length;
  expect(eventRequests().at(-1)).not.toContain('date_from');
  await press(renderer, 'Aplică filtrele');
  expect(eventRequests().length).toBeGreaterThan(beforeApply);
  for (const criterion of [
    'status=confirmed',
    'hall_id=hall-1',
    'date_from=2027-11-01',
    'date_to=2027-12-31',
    'type=nunta',
    'payment_status=partial',
  ]) {
    expect(eventRequests().at(-1)).toContain(criterion);
  }
  expect(renderer.root.findAllByType(BookingAdvancedFilters)).toHaveLength(0);
  await press(renderer, 'Filtre avansate');
  await select(renderer, 'Starea plății', 'paid');
  const beforeClose = eventRequests().length;
  await press(renderer, 'Închide filtrele avansate');
  expect(eventRequests()).toHaveLength(beforeClose);
  await press(renderer, 'Resetează filtrele');
  expect(eventRequests().at(-1)).not.toContain('payment_status');
  await unmount();
});
