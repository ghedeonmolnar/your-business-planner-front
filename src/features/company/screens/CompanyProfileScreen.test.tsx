import React from 'react';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  ProfileTestNavigator,
  profileNavigation,
  profileResponse,
  profileInput,
  pressProfileAction,
  openCompanySettings,
} from '@/features/company/utils/profileScreenTestUtils';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('meniul are o singură intrare pentru fiecare ecran, fără rezumate duplicate', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(profileResponse(url)),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ProfileTestNavigator />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Firmă și facturare'),
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      plannerAccount.name,
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      'Firma fiscală SRL',
    );
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([url]) => String(url).endsWith('/company')),
    ).toBe(false);
    await openCompanySettings(renderer);
    expect(profileNavigation.getCurrentRoute()?.name).toBe('CompanySettings');
    expect(profileInput(renderer, 'Numele companiei').props.value).toBe(
      plannerAccount.company?.name,
    );
    await pressProfileAction(renderer, 'Facturare');
    expect(profileInput(renderer, 'CUI').props.value).toBe('12345678');
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Firma fiscală SRL',
    );
    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: 'Editează datele de facturare',
      }),
    ).toHaveLength(0);
  } finally {
    await unmount();
  }
});

test.each(['admin', 'employee'])(
  'rolul %s are doar contul și securitatea, fără administrarea firmei',
  async role => {
    globalThis.fetch = jest.fn(url =>
      Promise.resolve(
        String(url).endsWith('/me')
          ? jsonResponse(200, { ...plannerAccount, role })
          : profileResponse(url),
      ),
    ) as typeof globalThis.fetch;
    const { renderer, unmount } = await renderWithProviders(
      <ProfileTestNavigator />,
    );
    try {
      expect(
        renderer.root.findAllByProps({
          accessibilityLabel: 'Firmă și facturare',
        }),
      ).toHaveLength(0);
      expect(
        jest
          .mocked(globalThis.fetch)
          .mock.calls.every(([url]) => String(url).endsWith('/me')),
      ).toBe(true);
      await pressProfileAction(renderer, 'Contul meu');
      await waitForUi(() =>
        expect(profileInput(renderer, 'Numele tău').props.disabled).toBe(true),
      );
      expect(
        renderer.root.findAllByProps({
          accessibilityLabel: 'Salvează profilul',
        }),
      ).toHaveLength(0);
      await pressProfileAction(renderer, 'Securitate');
      expect(profileInput(renderer, 'Parola actuală')).toBeDefined();
    } finally {
      await unmount();
    }
  },
);

test('eroarea facturilor nu este afișată drept o listă goală reușită', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).includes('/subscription-invoices')
        ? jsonResponse(500, { error: { code: 'SERVER_ERROR' } })
        : profileResponse(url),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ProfileTestNavigator />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Firmă și facturare'),
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      'Nu există facturi disponibile',
    );
  } finally {
    await unmount();
  }
});
