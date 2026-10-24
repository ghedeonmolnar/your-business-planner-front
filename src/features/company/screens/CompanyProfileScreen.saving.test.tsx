import React from 'react';
import { Modal } from 'react-native';
import { Switch } from 'react-native-paper';
import ReactTestRenderer from 'react-test-renderer';
import { CompanyProfileScreen } from '@/features/company/screens/CompanyProfileScreen';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test.each([
  {
    kind: 'owner',
    edit: 'Editează profilul meu',
    save: 'Salvează profilul',
    field: 'Numele tău',
  },
  {
    kind: 'company',
    edit: 'Editează firma și datele fiscale',
    save: 'Salvează profilul firmei',
    field: 'Numele companiei',
  },
])(
  'salvarea profilului $kind blochează câmpurile și închiderea modalului',
  async ({ kind, edit, save, field }) => {
    let resolve: ((response: Response) => void) | undefined;
    const pending = new Promise<Response>(done => {
      resolve = done;
    });
    globalThis.fetch = jest.fn((url, init) => {
      if (init?.method === 'PUT') return pending;
      return Promise.resolve(
        jsonResponse(
          200,
          String(url).endsWith('/me')
            ? plannerAccount
            : { ...plannerAccount.company, billing_profile: null },
        ),
      );
    }) as typeof globalThis.fetch;
    const { renderer, unmount } = await renderWithProviders(
      <CompanyProfileScreen />,
    );
    try {
      await waitForUi(() =>
        expect(
          renderer.root.findByProps({ accessibilityLabel: edit }),
        ).toBeDefined(),
      );
      await ReactTestRenderer.act(async () =>
        renderer.root.findByProps({ accessibilityLabel: edit }).props.onPress(),
      );
      await ReactTestRenderer.act(async () =>
        renderer.root
          .findByProps({ accessibilityLabel: field })
          .props.onChangeText('Nume actualizat'),
      );
      await ReactTestRenderer.act(async () => {
        const press = renderer.root.findByProps({ accessibilityLabel: save })
          .props.onPress;
        await Promise.all([press(), press()]);
      });
      await waitForUi(() =>
        expect(renderer.root.findByType(FormModalFrame).props.busy).toBe(true),
      );
      expect(
        renderer.root.findByProps({ accessibilityLabel: field }).props.disabled,
      ).toBe(true);
      if (kind === 'company')
        expect(renderer.root.findByType(Switch).props.disabled).toBe(true);
      await ReactTestRenderer.act(async () => {
        renderer.root.findByProps({ accessibilityLabel: save }).props.onPress();
        renderer.root
          .findAllByType(Modal)
          .find(modal => modal.props.visible)
          ?.props.onRequestClose();
      });
      expect(renderer.root.findAllByType(FormModalFrame)).toHaveLength(1);
      expect(
        jest
          .mocked(globalThis.fetch)
          .mock.calls.filter(([, init]) => init?.method === 'PUT'),
      ).toHaveLength(1);
      await ReactTestRenderer.act(async () =>
        resolve?.(
          jsonResponse(
            200,
            kind === 'owner'
              ? {
                  id: plannerAccount.id,
                  name: 'Nume actualizat',
                  email: plannerAccount.email,
                }
              : {
                  ...plannerAccount.company,
                  name: 'Nume actualizat',
                  billing_profile: null,
                },
          ),
        ),
      );
      await waitForUi(() =>
        expect(renderer.root.findAllByType(FormModalFrame)).toHaveLength(0),
      );
    } finally {
      resolve?.(jsonResponse(500, { error: { code: 'SERVER_ERROR' } }));
      await unmount();
    }
  },
);
