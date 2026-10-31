import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FormScreenFrame } from '@/shared/components/FormScreenFrame';
import {
  ProfileTestNavigator,
  profileNavigation,
  profileResponse,
  profileInput,
  changeProfileInput,
  pressProfileAction,
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

test.each([
  { edit: 'Contul meu', save: 'Salvează profilul', field: 'Numele tău' },
  {
    edit: 'Firmă și facturare',
    save: 'Salvează datele companiei',
    field: 'Numele companiei',
  },
])(
  'salvarea $field blochează câmpurile, taburile și submit-ul repetat',
  async ({ edit, save, field }) => {
    let resolve: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>(done => {
      resolve = done;
    });
    globalThis.fetch = jest.fn((url, init) =>
      init?.method === 'PUT' ? pending : Promise.resolve(profileResponse(url)),
    ) as typeof globalThis.fetch;
    const { renderer, unmount } = await renderWithProviders(
      <ProfileTestNavigator />,
    );
    try {
      await waitForUi(() =>
        expect(JSON.stringify(renderer.toJSON())).toContain(
          'Firmă și facturare',
        ),
      );
      await pressProfileAction(renderer, edit);
      await changeProfileInput(renderer, field, 'Nume actualizat');
      await pressProfileAction(renderer, save);
      await waitForUi(() =>
        expect(renderer.root.findByType(FormScreenFrame).props.busy).toBe(true),
      );
      expect(profileInput(renderer, field).props.disabled).toBe(true);
      await pressProfileAction(renderer, save);
      await ReactTestRenderer.act(async () => profileNavigation.goBack());
      expect(profileNavigation.getCurrentRoute()?.name).not.toBe(
        'CompanyProfile',
      );
      expect(
        jest
          .mocked(globalThis.fetch)
          .mock.calls.filter(([, init]) => init?.method === 'PUT'),
      ).toHaveLength(1);
      await ReactTestRenderer.act(async () =>
        resolve?.(jsonResponse(500, { error: { code: 'SERVER_ERROR' } })),
      );
      await waitForUi(() =>
        expect(profileInput(renderer, field).props.disabled).toBe(false),
      );
      expect(profileInput(renderer, field).props.value).toBe('Nume actualizat');
      expect(
        renderer.root.findByType(FormScreenFrame).props.hasUnsavedChanges,
      ).toBe(true);
    } finally {
      resolve?.(jsonResponse(500, { error: { code: 'SERVER_ERROR' } }));
      await unmount();
    }
  },
);
