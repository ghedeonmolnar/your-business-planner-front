import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FlatList, Linking } from 'react-native';
import { ClientDetailsScreen } from '@/features/clients/screens/ClientDetailsScreen';
import { Client } from '@/features/clients/types';
import { EventCard } from '@/features/events/components/EventCard';
import { EventTimeframeFilter } from '@/features/events/components/EventTimeframeFilter';
import { eventFixture } from '@/shared/test/apiFixtures';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const initialClient: Client = {
  id: 'client-1',
  name: 'Familia Popescu',
  phone: '0732652339',
  judet: 'Bihor',
  oras: 'Oradea',
  strada: 'Strada Client 1',
  source: 'facebook',
  notes: 'Preferă Minnie Mouse',
  last_contract_date: '2026-10-01',
  contacts: [
    { id: 'phone-1', kind: 'phone', value: '0732652339' },
    { id: 'email-1', kind: 'email', value: 'familia@example.com' },
  ],
  locations: [
    {
      id: 'location-1',
      location: 'Oradea',
      address: 'Locația evenimentului',
      last_event_date: '2026-09-01',
    },
  ],
};
const navigation = { goBack: jest.fn(), navigate: jest.fn() };
let client: Client;
let historyPages: number;
let historyFails: boolean;

const requestsTo = (path: string, method = 'GET') =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(
      ([url, options]) =>
        String(url).includes(path) && options?.method === method,
    );

beforeEach(() => {
  jest.clearAllMocks();
  client = { ...initialClient };
  historyPages = 1;
  historyFails = false;
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  globalThis.fetch = jest.fn((url, options) => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(
        jsonResponse(200, {
          id: 'user-1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
          employee_id: null,
        }),
      );
    }
    if (path.endsWith('/catalogs')) {
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [{ id: 'aniversare', name: 'Aniversare' }],
          client_sources: [{ id: 'facebook', name: 'Facebook' }],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [{ id: 'Oradea', name: 'Oradea' }],
        }),
      );
    }
    if (path.includes(`/clients/${client.id}/events`)) {
      if (historyFails) return Promise.resolve(jsonResponse(503, {}));
      const page = Number(new URL(path).searchParams.get('page'));
      return Promise.resolve(
        jsonResponse(200, {
          data: [{ ...eventFixture, id: `event-${page}` }],
          meta: {
            current_page: page,
            last_page: historyPages,
            total: historyPages,
          },
        }),
      );
    }
    if (options?.method === 'PUT') {
      client = { ...client, ...JSON.parse(String(options.body)) };
    }
    return Promise.resolve(
      jsonResponse(
        200,
        options?.method === 'DELETE'
          ? { message: 'Client deleted successfully' }
          : client,
      ),
    );
  }) as typeof globalThis.fetch;
});

afterEach(() => jest.restoreAllMocks());

const renderDetails = async () => {
  const rendered = await renderWithProviders(
    <ClientDetailsScreen
      navigation={navigation as never}
      route={{ params: { clientId: initialClient.id } } as never}
    />,
  );
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 30));
  });
  return rendered;
};

const pressAction = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) => {
  await ReactTestRenderer.act(async () => {
    const action = renderer.root
      .findAllByProps({ accessibilityLabel })
      .find(node => typeof node.props.onPress === 'function');
    if (!action) throw new Error(`Lipsește acțiunea ${accessibilityLabel}`);
    action.props.onPress();
  });
};

test('incarca toate detaliile, contacteaza clientul si deschide un eveniment', async () => {
  const { renderer, unmount } = await renderDetails();
  for (const children of [
    initialClient.name,
    initialClient.notes,
    'Facebook',
    'familia@example.com',
    'Locația evenimentului',
    '1 Octombrie, 2026',
  ]) {
    expect(renderer.root.findAllByProps({ children }).length).toBeGreaterThan(
      0,
    );
  }
  await pressAction(renderer, 'Sună clientul la 0732652339');
  await pressAction(renderer, 'Deschide WhatsApp pentru 0732652339');
  expect(Linking.openURL).toHaveBeenCalledWith('tel:+40732652339');
  expect(Linking.openURL).toHaveBeenCalledWith('https://wa.me/40732652339');
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(EventCard).props.onDetails(eventFixture);
  });
  expect(navigation.navigate).toHaveBeenCalledWith('EventDetails', {
    eventId: 'event-1',
  });
  await unmount();
});

test('incarca paginile la cerere si filtreaza istoricul pe server', async () => {
  historyPages = 2;
  const { renderer, unmount } = await renderDetails();
  expect(requestsTo('/events')).toHaveLength(1);
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(FlatList).props.onEndReached();
    await new Promise(resolve => setTimeout(resolve, 20));
  });
  expect(
    requestsTo('/events').some(([url]) => String(url).includes('page=2&')),
  ).toBe(true);
  expect(renderer.root.findAllByType(EventCard)).toHaveLength(2);
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(EventTimeframeFilter).props.onChange('past');
    await new Promise(resolve => setTimeout(resolve, 20));
  });
  expect(
    requestsTo('/events').some(([url]) =>
      String(url).includes('timeframe=past&page=1&per_page=20'),
    ),
  ).toBe(true);
  await unmount();
});

test('salveaza editarea clientului prin formular si actualizeaza pagina', async () => {
  const { renderer, unmount } = await renderDetails();
  await pressAction(renderer, 'Editează clientul');
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByProps({ accessibilityLabel: 'Nume' })[0]
      .props.onChangeText('Familia Ionescu');
  });
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByProps({ label: 'Salvează' }).props.onPress();
    await new Promise(resolve => setTimeout(resolve, 20));
  });
  expect(requestsTo('/clients/client-1', 'PUT')).toHaveLength(1);
  expect(
    renderer.root.findAllByProps({ children: 'Familia Ionescu' }).length,
  ).toBeGreaterThan(0);
  await unmount();
});

test('sterge numai dupa confirmare si revine la lista', async () => {
  const { renderer, unmount } = await renderDetails();
  await pressAction(renderer, 'Șterge clientul');
  expect(requestsTo('/clients/client-1', 'DELETE')).toHaveLength(0);
  await pressDialogButton(renderer, 'Șterge');
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });
  expect(requestsTo('/clients/client-1', 'DELETE')).toHaveLength(1);
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  await unmount();
});

test('eroarea istoricului permite reincercarea si pastreaza detaliile clientului', async () => {
  historyFails = true;
  const { renderer, unmount } = await renderDetails();
  expect(
    renderer.root.findAllByProps({ children: initialClient.name }).length,
  ).toBeGreaterThan(0);
  historyFails = false;
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(ErrorBanner).props.onRetry();
  });
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });
  expect(renderer.root.findAllByType(EventCard)).toHaveLength(1);
  await unmount();
});
