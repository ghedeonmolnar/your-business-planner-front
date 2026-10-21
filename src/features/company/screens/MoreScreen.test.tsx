import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { MoreScreen } from '@/features/company/screens/MoreScreen';
import { ActionTile } from '@/shared/components/ActionTile';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  getVisibleDialog,
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const pressAction = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    const action = renderer.root
      .findAllByType(ActionTile)
      .find(tile => tile.props.label === label);
    if (!action) {
      throw new Error(`Acțiunea ${label} nu este disponibilă.`);
    }
    action.props.onPress();
  });
};

test('company configuration hides optional navigation and displays trial and seat usage', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      jsonResponse(200, {
        ...plannerAccount,
        features: ['documents'],
        plan: {
          id: 'plan-1',
          name: 'Plan de test',
          user_limit: 2,
          users_used: 3,
        },
        subscription: { ...plannerAccount.subscription, trial: true },
      }),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Personal' }),
  ).toHaveLength(0);
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Financiar și statistici',
    }),
  ).toHaveLength(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Săli' }).length,
  ).toBeGreaterThan(0);
  expect(JSON.stringify(renderer.toJSON())).toContain('Perioadă de probă');
  expect(JSON.stringify(renderer.toJSON())).toContain('Plan de test');
  await unmount();
});

test('cardurile proprietarului deschid rutele existente', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
  for (const [label, route] of [
    ['Profil și facturare', 'CompanyProfile'],
    ['Săli', 'CompanyHalls'],
    ['Personal', 'CompanyStaff'],
    ['Financiar și statistici', 'CompanyOverview'],
    ['Conturi și invitații', 'CompanyTeam'],
  ]) {
    await pressAction(renderer, label);
    expect(mockNavigate).toHaveBeenLastCalledWith(route);
  }
  await unmount();
});

test.each(['admin', 'employee'] as const)(
  'rolul %s nu primește acțiunile rezervate proprietarului',
  async role => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(200, { ...plannerAccount, role })),
    ) as typeof globalThis.fetch;
    const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
    const labels = renderer.root
      .findAllByType(ActionTile)
      .map(tile => tile.props.label);
    expect(labels).not.toContain('Profil și facturare');
    expect(labels).not.toContain('Conturi și invitații');
    expect(labels).not.toContain('Gestionează abonamentul');
    if (role === 'employee') {
      expect(labels).not.toContain('Săli');
      expect(labels).not.toContain('Personal');
      expect(labels).not.toContain('Financiar și statistici');
    }
    await unmount();
  },
);

test('suportul deschide datele reale, fără trimiterea automată a unui mesaj', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      jsonResponse(200, {
        ...plannerAccount,
        support_email: 'contact@example.test',
        support_phone: '+40 (732) 652-339',
      }),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
  await pressAction(renderer, 'Contactează-ne');
  expect(openURL).not.toHaveBeenCalled();
  await pressAction(renderer, 'contact@example.test');
  expect(openURL).toHaveBeenLastCalledWith('mailto:contact%40example.test');
  await pressAction(renderer, '+40732652339');
  expect(openURL).toHaveBeenLastCalledWith('tel:+40732652339');
  await unmount();
});

test('gestionarea abonamentului explică fluxul existent de contactare a platformei', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
  await pressAction(renderer, 'Gestionează abonamentul');
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Pentru activarea, prelungirea sau modificarea abonamentului',
  );
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Datele de contact nu sunt disponibile',
  );
  await unmount();
});

test('deconectarea păstrează sesiunea la anulare și o închide numai după confirmare', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      jsonResponse(
        200,
        String(url).endsWith('/logout') ? { message: 'OK' } : plannerAccount,
      ),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<MoreScreen />);
  await pressAction(renderer, 'Deconectare');
  expect(getVisibleDialog(renderer)?.confirmLabel).toBe('Deconectează-mă');
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) => String(url).endsWith('/logout')),
  ).toBe(false);
  await pressDialogButton(renderer, 'Anulează');
  expect(getVisibleDialog(renderer)).toBeNull();
  await pressAction(renderer, 'Deconectare');
  await pressDialogButton(renderer, 'Deconectează-mă');
  await waitForUi(() => {
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([url]) => String(url).endsWith('/logout')),
    ).toBe(true);
  });
  await unmount();
});
