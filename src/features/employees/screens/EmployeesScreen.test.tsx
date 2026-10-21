import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeesScreen } from '@/features/employees/screens/EmployeesScreen';
import { employeeProfileFixture, mascotProfileFixture } from '@/shared/test/apiFixtures';
import {
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

beforeEach(() => {
  globalThis.fetch = jest.fn(url => {
    if (String(url).includes('/mascots')) {
      return Promise.resolve(paginatedResponse([mascotProfileFixture]));
    }

    return Promise.resolve(paginatedResponse([employeeProfileFixture]));
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('afișează echipa încărcată din API', async () => {
  const { renderer, unmount } = await renderWithProviders(<EmployeesScreen />);

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  expect(renderer.root.findAllByProps({ children: 'Ana Test' }).length).toBeGreaterThan(0);

  await unmount();
});
