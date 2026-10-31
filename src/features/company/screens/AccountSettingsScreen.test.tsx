import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  ProfileTestNavigator,
  profileResponse,
  profileInput,
  changeProfileInput,
  pressProfileAction,
} from '@/features/company/utils/profileScreenTestUtils';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
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

test('profilul și securitatea păstrează drafturi separate, iar numele se salvează fără parole sau email', async () => {
  let savedName = plannerAccount.name;
  const writes: unknown[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/profile') && init?.method === 'PUT') {
      const payload = JSON.parse(String(init.body));
      writes.push(payload);
      savedName = payload.name;
      return Promise.resolve(
        jsonResponse(200, {
          id: plannerAccount.id,
          name: savedName,
          email: plannerAccount.email,
        }),
      );
    }
    return Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, { ...plannerAccount, name: savedName })
        : profileResponse(url),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ProfileTestNavigator />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Firmă și facturare'),
    );
    await pressProfileAction(renderer, 'Contul meu');
    expect(profileInput(renderer, 'Email autentificare').props.editable).toBe(
      false,
    );
    await changeProfileInput(renderer, 'Numele tău', 'Nume nou');
    await pressProfileAction(renderer, 'Securitate');
    await changeProfileInput(renderer, 'Parola actuală', 'parola-actuala');
    await changeProfileInput(renderer, 'Parola nouă', 'parola-noua');
    await pressProfileAction(renderer, 'Date profil');
    expect(profileInput(renderer, 'Numele tău').props.value).toBe('Nume nou');
    await pressProfileAction(renderer, 'Salvează profilul');
    await waitForUi(() => expect(writes).toEqual([{ name: 'Nume nou' }]));
    await waitForUi(() =>
      expect(getVisibleDialog(renderer)?.title).toBe('Profil salvat'),
    );
    await pressDialogButton(renderer, 'OK');
    await pressProfileAction(renderer, 'Securitate');
    expect(profileInput(renderer, 'Parola actuală').props.value).toBe(
      'parola-actuala',
    );
    expect(profileInput(renderer, 'Parola nouă').props.value).toBe(
      'parola-noua',
    );
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.filter(([url]) => String(url).endsWith('/me')).length,
    ).toBeGreaterThanOrEqual(2);
  } finally {
    await unmount();
  }
});

test('parolele au reveal individual, iar confirmarea diferită oprește salvarea', async () => {
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
    await pressProfileAction(renderer, 'Contul meu');
    await pressProfileAction(renderer, 'Securitate');
    await changeProfileInput(renderer, 'Parola actuală', 'parola-actuala');
    await changeProfileInput(renderer, 'Parola nouă', 'parola-noua');
    await changeProfileInput(renderer, 'Confirmă parola nouă', 'alta-parola');
    expect(profileInput(renderer, 'Parola nouă').props.secureTextEntry).toBe(
      true,
    );
    const reveal = profileInput(renderer, 'Parola nouă').props.right;
    await ReactTestRenderer.act(async () => reveal.props.onPress());
    expect(profileInput(renderer, 'Parola nouă').props.secureTextEntry).toBe(
      false,
    );
    expect(profileInput(renderer, 'Parola actuală').props.secureTextEntry).toBe(
      true,
    );
    await pressProfileAction(renderer, 'Actualizează parola');
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([, init]) => init?.method === 'PUT'),
    ).toBe(false);
    expect(JSON.stringify(renderer.toJSON())).toContain('Parolele nu coincid.');
  } finally {
    await unmount();
  }
});
