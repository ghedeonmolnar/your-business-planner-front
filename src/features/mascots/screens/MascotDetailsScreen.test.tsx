import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { MascotDetailsScreen } from '@/features/mascots/screens/MascotDetailsScreen';
import { mascotProfileFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const route = { params: { mascotId: mascotProfileFixture.id } };

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, mascotProfileFixture)),
  ) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('afișează profilul mascotei încărcat din API', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <MascotDetailsScreen
      navigation={navigation as never}
      route={route as never}
    />,
  );

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  expect(renderer.root.findAllByProps({ children: 'Minnie' }).length).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({ children: 'Detalii mascotă' }).length).toBeGreaterThan(0);

  await unmount();
});
