import React from 'react';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';
import ReactTestRenderer from 'react-test-renderer';
import { CustomersScreen } from '@/features/company/screens/DirectoryScreen';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, canGoBack: () => true }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('lista compactă a clienților oferă istoric, creare și stare clară pentru telefon lipsă', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, plannerAccount)
        : paginatedResponse([
            {
              id: 'client-1',
              name: 'Client test',
              phone: null,
              bookings_count: 7,
            },
          ]),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  await waitForUi(() =>
    expect(renderedText(renderer)).toContain('Telefon necompletat'),
  );
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Înapoi' }),
  ).toHaveLength(0);
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({
        accessibilityLabel: 'Vezi rezervările pentru Client test',
      })
      .props.onPress();
  });
  expect(mockNavigate).toHaveBeenCalledWith('CustomerHistory', {
    clientId: 'client-1',
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Adaugă client' })
      .props.onPress();
  });
  expect(renderer.root.findAllByType(DirectoryForm)).toHaveLength(1);
  await unmount();
});
