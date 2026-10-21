import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeDetailsScreen } from '@/features/employees/screens/EmployeeDetailsScreen';
import { employeeProfileFixture } from '@/shared/test/apiFixtures';
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
const route = { params: { employeeId: employeeProfileFixture.id } };

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, employeeProfileFixture)),
  ) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('afișează profilul angajatului încărcat din API', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeDetailsScreen
      navigation={navigation as never}
      route={route as never}
    />,
  );

  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 20));
  });

  expect(
    renderer.root.findAllByProps({ children: 'Ana Test' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ children: 'Câștig total' }).length,
  ).toBeGreaterThan(0);

  await unmount();
});
