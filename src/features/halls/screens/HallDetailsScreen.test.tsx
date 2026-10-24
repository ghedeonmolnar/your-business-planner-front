import ReactTestRenderer from 'react-test-renderer';
import { HallActionsMenu } from '@/features/halls/components/HallActionsMenu';
import { HallConfiguration } from '@/features/halls/components/HallConfiguration';
import { HallNextBookings } from '@/features/halls/components/HallNextBookings';
import { HallBookingsScreen } from '@/features/halls/screens/HallBookingsScreen';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import {
  hallFetch,
  renderHallScreen,
  pressHallButton,
} from '@/features/halls/screens/hallScreens.testUtils';
import {
  getVisibleDialog,
  pressDialogButton,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

test('afișează datele reale, orele în ziua următoare și ascunde ștergerea unei săli cu istoric', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen();
  await waitForUi(() =>
    expect(renderedText(renderer)).toContain('Client test'),
  );
  const text = renderedText(renderer);
  expect(text).toContain('(+1 zi)');
  expect(text).toContain('200');
  expect(text).toContain('Notă privată');
  expect(
    renderer.root.findByType(HallActionsMenu).props.hall.permissions.can_delete,
  ).toBe(false);
  await pressHallButton(renderer, 'Acțiuni sală');
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Șterge sala' }),
  ).toHaveLength(0);
  await unmount();
});

test('dezactivarea cere confirmare și trimite doar starea și versiunea', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen();
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallActionsMenu)).toHaveLength(1),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(HallActionsMenu).props.onStatus(),
  );
  expect(getVisibleDialog(renderer)?.message).toContain(
    'Rezervările existente',
  );
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'POST'),
  ).toBe(false);
  await pressDialogButton(renderer, 'Dezactivează');
  await waitForUi(() =>
    expect(renderer.root.findByType(HallActionsMenu).props.hall.is_active).toBe(
      false,
    ),
  );
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(([url]) => String(url).endsWith('/status'));
  expect(JSON.parse(String(request?.[1]?.body))).toEqual({
    version: 1,
    is_active: false,
  });
  await unmount();
});

test('lipsa datelor opționale produce stări goale fără facilități sau valori simulate', async () => {
  hallFetch({
    minimum_guests: null,
    amenities: [],
    business_hours: [],
    internal_notes: null,
    next_bookings: [],
    future_bookings_count: 0,
    has_history: false,
  });
  const { renderer, unmount } = await renderHallScreen();
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallConfiguration)).toHaveLength(1),
  );
  const text = renderedText(renderer);
  expect(text).toContain('Nespecificat');
  expect(text).toContain('Nu sunt configurate facilități.');
  expect(text).toContain('Nu există rezervări viitoare pentru această sală.');
  expect(text).not.toContain('500 m²');
  await unmount();
});

test('fără permisiune de editare nu apare butonul sticky', async () => {
  hallFetch({
    permissions: {
      can_edit: false,
      can_duplicate: false,
      can_deactivate: false,
      can_delete: false,
    },
  });
  const { renderer, unmount } = await renderHallScreen();
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallActionsMenu)).toHaveLength(1),
  );
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Editează sala' }),
  ).toHaveLength(0);
  await unmount();
});

test('lista completă pornește cu filtrul viitor și păstrează sala la deschiderea istoricului', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen();
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallNextBookings)).toHaveLength(1),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(HallNextBookings).props.onAll(),
  );
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallBookingsScreen)).toHaveLength(1),
  );
  await waitForUi(() =>
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(
          ([url]) =>
            String(url).includes('hall_id=hall-1') &&
            String(url).includes('agenda=upcoming'),
        ),
    ).toBe(true),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(1),
  );
  await waitForUi(() =>
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(
          ([url]) =>
            String(url).includes('hall_id=hall-1') &&
            String(url).includes('timeframe=all') &&
            !String(url).includes('agenda='),
        ),
    ).toBe(true),
  );
  await unmount();
});
