import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { EventForm } from '@/features/events/components/EventForm';
import { EventsScreen } from '@/features/events/screens/EventsScreen';
import { EventFormValues } from '@/features/events/schemas/eventSchema';
import { catalogsFixture, eventFixture } from '@/shared/test/apiFixtures';
import {
  getVisibleDialog,
  jsonResponse,
  paginatedResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const mockFormValues: EventFormValues = {
  communication_channel: 'whatsapp',
  contact_phone: '0712345678',
  legacy_contact_allowed: false,
  mascot_ids: ['mascot-1'],
  assignments: [{ mascot_id: 'mascot-1', employee_id: 'employee-1' }],
  date: '2026-10-20',
  start_time: '10:00',
  end_time: '12:00',
  price_per_hour: 150,
  transport_cost: 20,
  location: 'Oradea',
  address: 'Strada Test 1',
  type: 'aniversare',
  status: 'confirmed',
};

jest.mock('@/features/events/components/EventForm', () => {
  const mockReact = jest.requireActual('react');
  const { Pressable: MockPressable } = jest.requireActual('react-native');

  return {
    EventForm: ({
      onSubmit,
      visible,
    }: {
      onSubmit: (values: EventFormValues) => void;
      visible: boolean;
    }) =>
      visible
        ? mockReact.createElement(MockPressable, {
            accessibilityLabel: 'Trimite evenimentul de test',
            onPress: () => onSubmit(mockFormValues),
          })
        : null,
  };
});

const requestsTo = (path: string, method: string) =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(
      ([url, options]) =>
        String(url).includes(path) &&
        (options as RequestInit | undefined)?.method === method,
    );

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  globalThis.fetch = jest.fn((url, options) => {
    if (String(url).includes('/catalogs')) {
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    }

    if (String(url).includes('/mascots')) {
      return Promise.resolve(paginatedResponse(eventFixture.mascots ?? []));
    }

    if ((options as RequestInit | undefined)?.method === 'POST') {
      return Promise.resolve(jsonResponse(201, eventFixture));
    }

    return Promise.resolve(paginatedResponse([]));
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const submitNewEvent = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Adaugă eveniment' })
      .props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Trimite evenimentul de test' })
      .props.onPress();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(EventForm).props.onDismiss();
  });
};

test('creează un eveniment prin API și propune trimiterea rezervării', async () => {
  const { renderer, unmount } = await renderWithProviders(<EventsScreen />);

  await submitNewEvent(renderer);

  const createCalls = requestsTo('/events', 'POST');

  expect(createCalls).toHaveLength(1);
  expect(JSON.parse(String(createCalls[0][1]?.body))).toMatchObject({
    assignments: [{ mascot_id: 'mascot-1', employee_id: 'employee-1' }],
    contact_phone: '0712345678',
    price_per_hour: 150,
  });
  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Felicitări!',
    message:
      'Ai introdus evenimentul din 20 Octombrie, 2026.\n\n' +
      'Vrei să trimiți detaliile rezervării și clientului?',
    confirmLabel: 'Da, trimite',
    cancelLabel: 'Nu',
  });
  expect(renderer.root.findByType(EventForm).props.visible).toBe(false);
  expect(Linking.openURL).not.toHaveBeenCalled();

  await unmount();
});

test('deschide WhatsApp cu detaliile și telefonul rezervării salvate', async () => {
  const { renderer, unmount } = await renderWithProviders(<EventsScreen />);

  await submitNewEvent(renderer);
  await pressDialogButton(renderer, 'Da, trimite');

  const expectedMessage =
    'Detaliile rezervării:\n' +
    'Data: 20 octombrie\n' +
    'Interval orar: 10-12\n' +
    'Personaje: Minnie\n' +
    'Locație: Strada Test 1, Oradea\n' +
    'Preț: 320 de lei';

  expect(Linking.openURL).toHaveBeenCalledTimes(1);
  expect(Linking.openURL).toHaveBeenCalledWith(
    `https://wa.me/40712345678?text=${encodeURIComponent(expectedMessage)}`,
  );
  expect(getVisibleDialog(renderer)).toBeNull();

  await unmount();
});

test('închide dialogul fără WhatsApp când se alege Nu', async () => {
  const { renderer, unmount } = await renderWithProviders(<EventsScreen />);

  await submitNewEvent(renderer);
  await pressDialogButton(renderer, 'Nu');

  expect(getVisibleDialog(renderer)).toBeNull();
  expect(Linking.openURL).not.toHaveBeenCalled();
  expect(requestsTo('/events', 'POST')).toHaveLength(1);

  await unmount();
});

test('păstrează formularul și nu propune trimiterea dacă salvarea eșuează', async () => {
  const originalFetch = jest.mocked(globalThis.fetch).getMockImplementation()!;
  jest
    .mocked(globalThis.fetch)
    .mockImplementation((url, options) =>
      options?.method === 'POST'
        ? Promise.resolve(
            jsonResponse(500, { error: { code: 'SERVER_ERROR' } }),
          )
        : originalFetch(url, options),
    );
  const { renderer, unmount } = await renderWithProviders(<EventsScreen />);

  await submitNewEvent(renderer);

  expect(getVisibleDialog(renderer)?.title).toBe('Eroare');
  expect(renderer.root.findByType(EventForm).props.visible).toBe(true);
  expect(Linking.openURL).not.toHaveBeenCalled();

  await unmount();
});

test('arată alegerea destinatarului când rezervarea nu are telefon', async () => {
  const originalFetch = jest.mocked(globalThis.fetch).getMockImplementation()!;
  jest.mocked(globalThis.fetch).mockImplementation((url, options) =>
    options?.method === 'POST'
      ? Promise.resolve(
          jsonResponse(201, {
            ...eventFixture,
            communication_channel: 'facebook',
            contact_value: 'client.test',
            contact_phone: null,
          }),
        )
      : originalFetch(url, options),
  );
  const { renderer, unmount } = await renderWithProviders(<EventsScreen />);

  await submitNewEvent(renderer);
  await pressDialogButton(renderer, 'Da, trimite');

  expect(Linking.openURL).toHaveBeenCalledTimes(1);
  expect(jest.mocked(Linking.openURL).mock.calls[0][0]).toMatch(
    /^https:\/\/wa\.me\/\?text=/,
  );

  await unmount();
});
