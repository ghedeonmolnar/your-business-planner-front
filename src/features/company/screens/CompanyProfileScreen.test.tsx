import React from 'react';
import { waitForUi } from '@/shared/test/waitForUi';
import ReactTestRenderer from 'react-test-renderer';
import { CompanyProfileScreen } from '@/features/company/screens/CompanyProfileScreen';
import { CompanySettingsForm } from '@/features/company/components/CompanySettingsForm';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('profilul ownerului precompletează formularul din datele fiscale salvate', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      jsonResponse(
        200,
        String(url).endsWith('/me')
          ? plannerAccount
          : {
              ...plannerAccount.company,
              billing_profile: {
                fiscal_code: '12345678',
                legal_name: 'Firma fiscală SRL',
                address: 'Adresa fiscală',
                country: 'RO',
                vat_registered: true,
                iban: 'RO49AAAA1B31007593840000',
                bank_name: 'Banca test',
              },
            },
      ),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <CompanyProfileScreen />,
  );
  await waitForUi(() =>
    expect(JSON.stringify(renderer.toJSON())).toContain('Firma fiscală SRL'),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Editează firma și datele fiscale' })
      .props.onPress();
  });
  const form = renderer.root.findByType(CompanySettingsForm);
  expect(form.findByProps({ accessibilityLabel: 'CUI' }).props.value).toBe(
    '12345678',
  );
  expect(
    form.findByProps({ accessibilityLabel: 'Denumire juridică' }).props.value,
  ).toBe('Firma fiscală SRL');
  await unmount();
});

test('căutarea după CUI precompletează datele și le salvează în profilul firmei', async () => {
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.endsWith('/fiscal-lookup')) {
      return Promise.resolve(
        jsonResponse(200, {
          fiscal_code: '12345678',
          legal_name: 'Firma găsită SRL',
          address: 'Adresa ANAF',
          country: 'RO',
          vat_registered: true,
        }),
      );
    }
    if (init?.method === 'PUT') {
      const payload: Record<string, unknown> = JSON.parse(String(init.body));
      return Promise.resolve(
        jsonResponse(200, { id: 'company-1', ...payload }),
      );
    }
    return Promise.resolve(
      jsonResponse(200, { ...plannerAccount.company, billing_profile: null }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <CompanyProfileScreen />,
  );
  await waitForUi(() =>
    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: 'Completează datele fiscale',
      }),
    ).toHaveLength(1),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Completează datele fiscale' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'CUI' })
      .props.onChangeText('12345678');
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Completează după CUI' })
      .props.onPress();
  });
  await pressDialogButton(renderer, 'OK');
  expect(
    renderer.root.findByProps({ accessibilityLabel: 'Denumire juridică' }).props
      .value,
  ).toBe('Firma găsită SRL');
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Salvează profilul firmei' })
      .props.onPress();
  });
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(
      ([url, init]) =>
        String(url).endsWith('/company') && init?.method === 'PUT',
    );
  expect(request).toBeDefined();
  expect(JSON.parse(String(request?.[1]?.body))).toMatchObject({
    billing_profile: {
      fiscal_code: '12345678',
      legal_name: 'Firma găsită SRL',
      address: 'Adresa ANAF',
      vat_registered: true,
    },
  });
  await unmount();
});
