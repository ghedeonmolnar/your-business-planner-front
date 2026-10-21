import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import dayjs from 'dayjs';
import { AuthUser } from '@/features/auth/types';
import { EventDetailsScreen } from '@/features/events/screens/EventDetailsScreen';
import { Event, EventPaymentPayload } from '@/features/events/types';
import { eventFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const mockPaymentPayload: EventPaymentPayload = {
  type: 'incoming',
  category: 'advance',
  amount: 100,
  paid_at: '2026-10-01',
  method: 'cash',
  status: 'completed',
};

jest.mock('@/features/events/components/PaymentForm', () => {
  const mockReact = jest.requireActual('react');
  const { Pressable: MockPressable } = jest.requireActual('react-native');

  return {
    PaymentForm: ({
      onSubmit,
      visible,
    }: {
      onSubmit: (payload: EventPaymentPayload) => void;
      visible: boolean;
    }) =>
      visible
        ? mockReact.createElement(MockPressable, {
            accessibilityLabel: 'Trimite plată de test',
            onPress: () => onSubmit(mockPaymentPayload),
          })
        : null,
  };
});

const navigation = { goBack: jest.fn() };
const route = { params: { eventId: eventFixture.id } };
let signedInRole: AuthUser['role'];
let loadedEvent: Event;

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
  signedInRole = 'admin';
  loadedEvent = {
    ...eventFixture,
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  };
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  globalThis.fetch = jest.fn((url, options) => {
    if (String(url).endsWith('/me')) {
      return Promise.resolve(
        jsonResponse(200, {
          id: 'user-1',
          name: 'Admin Test',
          email: 'admin@example.com',
          role: signedInRole,
          employee_id: signedInRole === 'employee' ? 'employee-1' : null,
        }),
      );
    }
    if (
      String(url).includes(`/events/${eventFixture.id}/payments`) &&
      (options as RequestInit | undefined)?.method === 'POST'
    ) {
      return Promise.resolve(
        jsonResponse(201, {
          id: 'payment-1',
          event_id: eventFixture.id,
          ...mockPaymentPayload,
        }),
      );
    }

    if (String(url).includes(`/events/${eventFixture.id}/payments`)) {
      return Promise.resolve(paginatedResponse([]));
    }

    if (String(url).includes(`/events/${eventFixture.id}/documents`)) {
      return Promise.resolve(paginatedResponse([]));
    }

    if (String(url).includes(`/events/${eventFixture.id}`)) {
      return Promise.resolve(jsonResponse(200, loadedEvent));
    }

    return Promise.resolve(jsonResponse(404, { message: 'Lipsa' }));
  }) as unknown as typeof globalThis.fetch;
});

const renderDetails = async () => {
  const rendered = await renderWithProviders(
    <EventDetailsScreen
      navigation={navigation as never}
      route={route as never}
    />,
  );
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 20));
  });
  return rendered;
};

test('adminul poate trimite repetat detaliile unui eveniment viitor', async () => {
  const { renderer, unmount } = await renderDetails();
  const button = renderer.root.findByProps({
    label: 'Trimite detaliile rezervării',
  });

  await ReactTestRenderer.act(async () => {
    button.props.onPress();
    button.props.onPress();
  });

  const message =
    'Detaliile rezervării:\n' +
    `Data: ${dayjs(loadedEvent.date).format('D MMMM').toLowerCase()}\n` +
    'Interval orar: 10-12\nPersonaje: Minnie\n' +
    'Locație: Strada Test 1, Oradea\nPreț: 320 de lei';
  expect(Linking.openURL).toHaveBeenCalledTimes(2);
  expect(Linking.openURL).toHaveBeenNthCalledWith(
    2,
    `https://wa.me/40712345678?text=${encodeURIComponent(message)}`,
  );

  await unmount();
});

test('angajatul nu vede butonul de trimitere a rezervării', async () => {
  signedInRole = 'employee';
  const { renderer, unmount } = await renderDetails();

  expect(
    renderer.root.findAllByProps({ label: 'Trimite detaliile rezervării' }),
  ).toHaveLength(0);
  expect(Linking.openURL).not.toHaveBeenCalled();

  await unmount();
});

test('evenimentul trecut nu are buton de trimitere a rezervării', async () => {
  loadedEvent = {
    ...loadedEvent,
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  };
  const { renderer, unmount } = await renderDetails();

  expect(
    renderer.root.findAllByProps({ label: 'Trimite detaliile rezervării' }),
  ).toHaveLength(0);

  await unmount();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('înregistrează o încasare din ecran prin API', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EventDetailsScreen
      navigation={navigation as never}
      route={route as never}
    />,
  );

  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 20));
  });

  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ label: 'Adaugă plată' }).props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Trimite plată de test' })
      .props.onPress();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  const createCalls = requestsTo(`/events/${eventFixture.id}/payments`, 'POST');

  expect(createCalls).toHaveLength(1);
  expect(JSON.parse(String(createCalls[0][1]?.body))).toMatchObject({
    amount: 100,
    category: 'advance',
  });

  await unmount();
});
