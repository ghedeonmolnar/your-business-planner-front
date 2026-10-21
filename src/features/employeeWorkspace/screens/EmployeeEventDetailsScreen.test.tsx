import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeEventDetailsScreen } from '@/features/employeeWorkspace/screens/EmployeeEventDetailsScreen';
import { employeeEventFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const navigation = { goBack: jest.fn() };
const route = { params: { eventId: employeeEventFixture.id } };

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, employeeEventFixture)),
  ) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('afișează detaliile evenimentului angajatului din API', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeEventDetailsScreen
      navigation={navigation as never}
      route={route as never}
    />,
  );

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  expect(renderer.root.findAllByProps({ children: 'Echipă și program' }).length).toBeGreaterThan(0);
  expect(JSON.stringify(renderer.toJSON())).toContain('Aniversare');

  await unmount();
});
