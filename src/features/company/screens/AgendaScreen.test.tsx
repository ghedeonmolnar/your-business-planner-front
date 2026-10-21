import React from 'react';
import { AgendaScreen } from '@/features/company/screens/AgendaScreen';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('agenda cere date valide când motorul returnează text localizat incompatibil', async () => {
  const localized = jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('21 octombrie 2026');
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, { ...plannerAccount, features: [] })
        : paginatedResponse([plannerBooking]),
    ),
  ) as typeof globalThis.fetch;
  try {
    const { renderer, unmount } = await renderWithProviders(<AgendaScreen />);
    const calls = jest
      .mocked(globalThis.fetch)
      .mock.calls.map(([url]) => String(url));
    expect(
      calls.some(url => /\/events\?date_from=\d{4}-\d{2}-\d{2}/.test(url)),
    ).toBe(true);
    expect(calls.every(url => !url.includes('Invalid'))).toBe(true);
    expect(JSON.stringify(renderer.toJSON())).toContain(
      plannerBooking.client_name,
    );
    await unmount();
  } finally {
    localized.mockRestore();
  }
});
