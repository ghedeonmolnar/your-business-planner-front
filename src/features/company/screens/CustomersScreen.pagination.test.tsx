import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CustomersScreen } from '@/features/company/screens/CustomersScreen';
import { CustomerCard } from '@/features/company/components/CustomerCard';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('o pagină eșuată păstrează clienții încărcați și retry adaugă rezultatele fără duplicate', async () => {
  let pageTwoCalls = 0;
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    const second = /[?&]page=2(?:&|$)/.test(path);
    if (second && ++pageTwoCalls === 1)
      return Promise.resolve(
        jsonResponse(500, { error: { code: 'SERVER_ERROR' } }),
      );
    return Promise.resolve(
      jsonResponse(200, {
        data: [
          {
            id: second ? 'client-2' : 'client-1',
            version: 1,
            name: second ? 'Maria' : 'Ana',
            bookings_count: 1,
          },
        ],
        meta: { current_page: second ? 2 : 1, last_page: 2, total: 2 },
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CustomerCard)).toHaveLength(1),
    );
    await ReactTestRenderer.act(async () => {
      const press = renderer.root
        .findByType(PaginationFooter)
        .findByType(AppButton).props.onPress;
      void press();
      void press();
    });
    await waitForUi(() =>
      expect(
        renderer.root.findByType(PaginationFooter).props.error,
      ).toBeTruthy(),
    );
    expect(pageTwoCalls).toBe(1);
    expect(
      renderer.root
        .findAllByType(CustomerCard)
        .map(card => card.props.customer.id),
    ).toEqual(['client-1']);
    await ReactTestRenderer.act(async () => {
      await renderer.root
        .findByType(PaginationFooter)
        .findByType(AppButton)
        .props.onPress();
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(CustomerCard)).toHaveLength(2),
    );
    expect(pageTwoCalls).toBe(2);
    expect(
      renderer.root
        .findAllByType(CustomerCard)
        .map(card => card.props.customer.id),
    ).toEqual(['client-1', 'client-2']);
  } finally {
    await unmount();
  }
});
