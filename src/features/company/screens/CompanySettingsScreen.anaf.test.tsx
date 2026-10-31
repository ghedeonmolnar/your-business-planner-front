import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FiscalLookupReview } from '@/features/company/components/FiscalLookupReview';
import {
  ProfileTestNavigator,
  openCompanySettings,
  profileCompany,
  profileResponse,
  changeProfileInput,
  pressProfileAction,
  profileInput,
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

const anafProfile = {
  fiscal_code: '12345678',
  legal_name: 'Firma găsită SRL',
  address: 'Adresa ANAF',
  country: 'RO',
  vat_registered: true,
};

test('ANAF cere acord explicit, păstrează banca și contactele, apoi salvează draftul complet', async () => {
  const writes: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/fiscal-lookup'))
      return Promise.resolve(jsonResponse(200, anafProfile));
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
    await openCompanySettings(renderer);
    await changeProfileInput(
      renderer,
      'Numele companiei',
      'Nume comercial nou',
    );
    await changeProfileInput(
      renderer,
      'Adresă companie',
      'Adresă de contact separată',
    );
    await pressProfileAction(renderer, 'Facturare');
    await changeProfileInput(renderer, 'CUI', 'RO 12345678');
    await changeProfileInput(renderer, 'Denumire juridică', 'Denumire manuală');
    await pressProfileAction(renderer, 'Completează după CUI');
    await waitForUi(() =>
      expect(renderer.root.findAllByType(FiscalLookupReview)).toHaveLength(1),
    );
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Denumire manuală',
    );
    expect(writes).toHaveLength(0);
    const apply = renderer.root
      .findAllByProps({ accessibilityLabel: 'Aplică în formular' })
      .find(node => typeof node.props.onPress === 'function')!;
    expect(apply.props.disabled).toBe(false);
    await pressProfileAction(renderer, 'Aplică în formular');
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Firma găsită SRL',
    );
    expect(profileInput(renderer, 'IBAN').props.value).toBe(
      profileCompany.billing_profile?.iban,
    );
    expect(JSON.stringify(renderer.toJSON())).toContain('Adresa ANAF');
    expect(writes).toHaveLength(0);
    await pressProfileAction(renderer, 'Date companie');
    expect(profileInput(renderer, 'Numele companiei').props.value).toBe(
      'Nume comercial nou',
    );
    await pressProfileAction(renderer, 'Facturare');
    await pressProfileAction(renderer, 'Salvează datele fiscale');
    await waitForUi(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      name: 'Nume comercial nou',
      address: 'Adresă de contact separată',
      billing_profile: {
        ...anafProfile,
        iban: profileCompany.billing_profile?.iban,
        bank_name: 'Banca test',
      },
    });
    const lookup = jest
      .mocked(globalThis.fetch)
      .mock.calls.find(([url]) => String(url).endsWith('/fiscal-lookup'));
    expect(JSON.parse(String(lookup?.[1]?.body))).toEqual({
      fiscal_code: '12345678',
    });
  } finally {
    await unmount();
  }
});

test('răspunsul ANAF întârziat pentru alt CUI nu înlocuiește draftul', async () => {
  let resolve: ((value: Response) => void) | undefined;
  globalThis.fetch = jest.fn(url =>
    String(url).endsWith('/fiscal-lookup')
      ? new Promise<Response>(done => {
          resolve = done;
        })
      : Promise.resolve(profileResponse(url)),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ProfileTestNavigator />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Firmă și facturare'),
    );
    await openCompanySettings(renderer, 'billing');
    await pressProfileAction(renderer, 'Completează după CUI');
    await changeProfileInput(renderer, 'CUI', '87654321');
    await changeProfileInput(renderer, 'Denumire juridică', 'Date manuale');
    await ReactTestRenderer.act(async () =>
      resolve?.(jsonResponse(200, anafProfile)),
    );
    expect(renderer.root.findAllByType(FiscalLookupReview)).toHaveLength(0);
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Date manuale',
    );
  } finally {
    resolve?.(jsonResponse(200, anafProfile));
    await unmount();
  }
});
