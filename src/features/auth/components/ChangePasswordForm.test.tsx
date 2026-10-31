import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { clearAuthToken } from '@/shared/storage/authTokenStorage';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('testing-only-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('schimbarea parolei cere confirmare și închide sesiunea numai după salvare', async () => {
  const changes: unknown[] = [];
  globalThis.fetch = jest.fn((url, options) => {
    if (options?.method === 'PUT') {
      changes.push(JSON.parse(String(options.body)));
      return Promise.resolve(jsonResponse(200, { status: 'password_changed' }));
    }
    return Promise.resolve(
      jsonResponse(200, String(url).endsWith('/me') ? plannerAccount : {}),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ChangePasswordForm onClose={jest.fn()} />,
  );
  try {
    await waitForUi(() =>
      expect(
        renderer.root.findAllByType(TextInput).length,
      ).toBeGreaterThanOrEqual(3),
    );
    for (const [label, value] of [
      ['Parola actuală', 'old-password'],
      ['Parola nouă', 'new-password'],
      ['Confirmă parola nouă', 'new-password'],
    ]) {
      await ReactTestRenderer.act(async () => {
        renderer.root
          .findAllByType(TextInput)
          .find(input => input.props.accessibilityLabel === label)!
          .props.onChangeText(value);
      });
    }
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByProps({ accessibilityLabel: 'Schimbă parola' })
        .find(node => typeof node.props.onPress === 'function')!
        .props.onPress();
    });
    expect(changes).toHaveLength(0);
    await pressDialogButton(renderer, 'Schimbă parola');
    await waitForUi(() => expect(changes).toHaveLength(1));
    expect(changes[0]).toEqual({
      current_password: 'old-password',
      password: 'new-password',
      password_confirmation: 'new-password',
    });
    await waitForUi(() => expect(clearAuthToken).toHaveBeenCalled());
  } finally {
    await unmount();
  }
});
