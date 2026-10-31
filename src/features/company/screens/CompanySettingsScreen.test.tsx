import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Switch } from 'react-native-paper';
import {
  ProfileTestNavigator,
  openCompanySettings,
  profileCompany,
  profileResponse,
  profileNavigation,
  changeProfileInput,
  pressProfileAction,
  profileInput,
} from '@/features/company/utils/profileScreenTestUtils';
import {
  jsonResponse,
  getVisibleDialog,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('TVA are semantică afirmativă, preview din draft și payload fiscal complet', async () => {
  const writes: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (init?.method === 'PUT') {
      const payload: Record<string, unknown> = JSON.parse(String(init.body));
      writes.push(payload);
      return Promise.resolve(
        jsonResponse(200, { id: profileCompany.id, ...payload }),
      );
    }
    return Promise.resolve(profileResponse(url));
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ProfileTestNavigator />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Firmă și facturare'),
    );
    await openCompanySettings(renderer, 'billing');
    await changeProfileInput(renderer, 'Denumire juridică', 'Denumire nouă');
    await changeProfileInput(renderer, 'IBAN', 'ro49 aaaa 1b31 0075 9384 0000');
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(Switch).props.onValueChange(true),
    );
    expect(JSON.stringify(renderer.toJSON())).toContain('Plătitoare de TVA');
    await pressProfileAction(renderer, 'Date companie');
    await pressProfileAction(renderer, 'Facturare');
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Denumire nouă',
    );
    await pressProfileAction(renderer, 'Salvează datele fiscale');
    await waitForUi(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      name: profileCompany.name,
      billing_profile: {
        ...profileCompany.billing_profile,
        legal_name: 'Denumire nouă',
        vat_registered: true,
      },
    });
  } finally {
    await unmount();
  }
});

test('back protejează modificările din tabul inactiv și permite abandonul explicit', async () => {
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
    await openCompanySettings(renderer);
    await changeProfileInput(renderer, 'Numele companiei', 'Nesalvat');
    await pressProfileAction(renderer, 'Facturare');
    await ReactTestRenderer.act(async () => profileNavigation.goBack());
    await waitForUi(() =>
      expect(getVisibleDialog(renderer)?.title).toBe('Renunți la modificări?'),
    );
    await pressDialogButton(renderer, 'Continuă editarea');
    await pressProfileAction(renderer, 'Date companie');
    expect(profileInput(renderer, 'Numele companiei').props.value).toBe(
      'Nesalvat',
    );
    await ReactTestRenderer.act(async () => profileNavigation.goBack());
    await pressDialogButton(renderer, 'Renunță');
    expect(profileNavigation.getCurrentRoute()?.name).toBe('CompanyProfile');
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([, init]) => init?.method === 'PUT'),
    ).toBe(false);
  } finally {
    await unmount();
  }
});
