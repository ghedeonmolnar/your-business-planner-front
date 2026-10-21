import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ClientsScreen } from '@/features/clients/screens/ClientsScreen';
import {
  jsonResponse,
  paginatedResponse,
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

const existingClient = {
  id: 'client-1',
  name: 'Familia Popescu',
  phone: '0732652339',
  judet: 'Bihor',
  oras: 'Oradea',
  strada: null,
  source: 'facebook',
  notes: null,
};

const requestsTo = (path: string, method: string) =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(
      ([url, options]) =>
        String(url).includes(path) &&
        (options as RequestInit | undefined)?.method === method,
    );

beforeEach(() => {
  mockNavigate.mockClear();
  globalThis.fetch = jest.fn(url => {
    if (String(url).includes('/catalogs')) {
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [],
          client_sources: [{ id: 'facebook', name: 'Facebook' }],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [{ id: 'Oradea', name: 'Oradea' }],
        }),
      );
    }

    return Promise.resolve(paginatedResponse([existingClient]));
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('lists the clients loaded from the API', async () => {
  const { renderer, unmount } = await renderWithProviders(<ClientsScreen />);

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  expect(
    renderer.root.findAllByProps({ children: 'Familia Popescu' }).length,
  ).toBeGreaterThan(0);
  expect(requestsTo('/clients', 'GET').length).toBeGreaterThan(0);

  await unmount();
});

test('deschide pagina dedicata clientului din card si din actiunea de istoric', async () => {
  const { renderer, unmount } = await renderWithProviders(<ClientsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  for (const accessibilityLabel of [
    'Vezi detaliile clientului Familia Popescu',
    'Vezi istoricul clientului',
  ]) {
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByProps({ accessibilityLabel })
        .find(node => typeof node.props.onPress === 'function')
        ?.props.onPress();
    });
  }

  expect(mockNavigate).toHaveBeenCalledTimes(2);
  expect(mockNavigate).toHaveBeenLastCalledWith('ClientDetails', {
    clientId: existingClient.id,
  });
  await unmount();
});

test('sends the new client to the API and closes the form', async () => {
  const { renderer, unmount } = await renderWithProviders(<ClientsScreen />);

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Adaugă client' })
      .props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByProps({ accessibilityLabel: 'Nume' })[0]
      .props.onChangeText('Familia Ionescu');
  });

  jest
    .mocked(globalThis.fetch)
    .mockResolvedValueOnce(
      jsonResponse(201, { ...existingClient, id: 'client-2' }),
    );

  await ReactTestRenderer.act(async () => {
    await renderer.root.findByProps({ label: 'Salvează' }).props.onPress();
  });

  const createCalls = requestsTo('/clients', 'POST');

  expect(createCalls).toHaveLength(1);
  expect(JSON.parse(String(createCalls[0][1]?.body))).toMatchObject({
    name: 'Familia Ionescu',
  });

  await unmount();
});

test('selectează orașul clientului din lista de localități', async () => {
  const { renderer, unmount } = await renderWithProviders(<ClientsScreen />);

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Adaugă client' })
      .props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByProps({ accessibilityLabel: 'Oraș' })
      .find(node => typeof node.props.onPress === 'function')
      ?.props.onPress();
  });

  expect(
    renderer.root
      .findAllByProps({ accessibilityLabel: 'Oradea' })
      .some(node => typeof node.props.onPress === 'function'),
  ).toBe(true);

  await unmount();
});
