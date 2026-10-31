import React from 'react';
import { FiscalLookupReview } from '@/features/company/components/FiscalLookupReview';
import ReactTestRenderer from 'react-test-renderer';
import { onlineManager } from '@tanstack/react-query';
import {
  ProfileTestNavigator,
  openCompanySettings,
  profileResponse,
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

test('ANAF indisponibil păstrează draftul și permite salvarea manuală', async () => {
  const writes: unknown[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/fiscal-lookup'))
      return Promise.resolve(
        jsonResponse(503, { error: { code: 'FISCAL_LOOKUP_UNAVAILABLE' } }),
      );
    if (init?.method === 'PUT') {
      const payload: Record<string, unknown> = JSON.parse(String(init.body));
      writes.push(payload);
      return Promise.resolve(
        jsonResponse(200, { id: 'company-1', ...payload }),
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
    await changeProfileInput(
      renderer,
      'Denumire juridică',
      'Date completate manual',
    );
    await pressProfileAction(renderer, 'Completează după CUI');
    await waitForUi(() => expect(getVisibleDialog(renderer)).not.toBeNull());
    await pressDialogButton(renderer, 'OK');
    expect(renderer.root.findAllByType(FiscalLookupReview)).toHaveLength(0);
    expect(profileInput(renderer, 'Denumire juridică').props.value).toBe(
      'Date completate manual',
    );
    await pressProfileAction(renderer, 'Salvează datele fiscale');
    await waitForUi(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      billing_profile: { legal_name: 'Date completate manual' },
    });
  } finally {
    await unmount();
  }
});

test('salvarea offline păstrează draftul și nu confirmă succes înainte de reconectare', async () => {
  const writes: unknown[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (init?.method === 'PUT') {
      const payload: Record<string, unknown> = JSON.parse(String(init.body));
      writes.push(payload);
      return Promise.resolve(
        jsonResponse(200, { id: 'company-1', ...payload }),
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
    await changeProfileInput(renderer, 'Numele companiei', 'Draft offline');
    await ReactTestRenderer.act(async () => onlineManager.setOnline(false));
    await pressProfileAction(renderer, 'Salvează datele companiei');
    expect(writes).toHaveLength(0);
    expect(getVisibleDialog(renderer)).toBeNull();
    expect(JSON.stringify(renderer.toJSON())).toContain('Ești offline.');
    expect(profileInput(renderer, 'Numele companiei').props.value).toBe(
      'Draft offline',
    );
    await ReactTestRenderer.act(async () => onlineManager.setOnline(true));
    await waitForUi(() => expect(writes).toHaveLength(1));
    await waitForUi(() =>
      expect(getVisibleDialog(renderer)?.title).toBe('Date salvate'),
    );
  } finally {
    await ReactTestRenderer.act(async () => onlineManager.setOnline(true));
    await unmount();
  }
});
