import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { AppDialog } from '@/shared/components/AppDialog';
import { ResetPasswordPanel } from '@/features/auth/components/ResetPasswordPanel';
import {
  getVisibleDialog,
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

const email = 'cont@example.com';
const password = 'ParolaNoua123';

const field = (renderer: ReactTestRenderer.ReactTestRenderer, name: string) =>
  renderer.root
    .findAllByType(TextInput)
    .find(input => input.props.testID === `input:${name}`)!;

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onPress();
  });
};

const fill = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  values: Record<string, string>,
) => {
  await ReactTestRenderer.act(async () => {
    Object.entries(values).forEach(([name, value]) => {
      field(renderer, name).props.onChangeText(value);
    });
  });
};

beforeEach(() => {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(jsonResponse(200, { message: 'OK' }));
});

test.each(['Înapoi la autentificare', 'dismiss'])(
  'password reset returns to login through the success dialog: %s',
  async action => {
    const onPasswordReset = jest.fn();
    const { renderer, unmount } = await renderWithProviders(
      <ResetPasswordPanel
        initialEmail={email}
        onPasswordReset={onPasswordReset}
      />,
    );

    await fill(renderer, {
      code: '123456',
      password,
      password_confirmation: password,
    });
    await press(renderer, 'Resetează parola');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/password/reset'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email,
          code: '123456',
          password,
          password_confirmation: password,
        }),
      }),
    );
    expect(onPasswordReset).not.toHaveBeenCalled();
    expect(getVisibleDialog(renderer)).toMatchObject({
      title: 'Parolă actualizată',
      icon: 'checkmark',
      tone: 'success',
      centered: true,
      confirmLabel: 'Înapoi la autentificare',
    });

    if (action === 'dismiss') {
      await ReactTestRenderer.act(async () => {
        await renderer.root.findByType(AppDialog).props.onCancel();
      });
    } else {
      await pressDialogButton(renderer, action);
    }
    expect(onPasswordReset).toHaveBeenCalledWith(email);
    expect(onPasswordReset).toHaveBeenCalledTimes(1);
    expect(getVisibleDialog(renderer)).toBeNull();

    await unmount();
  },
);

test('resending uses the current email and clears only the old code after success', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <ResetPasswordPanel initialEmail={email} onPasswordReset={jest.fn()} />,
  );
  await fill(renderer, { email: 'alt@example.com', code: '111111', password });
  await press(renderer, 'Retrimite codul');

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/password/forgot'),
    expect.objectContaining({
      body: JSON.stringify({ email: 'alt@example.com' }),
    }),
  );
  expect(field(renderer, 'code').props.value).toBe('');
  expect(field(renderer, 'password').props.value).toBe(password);
  expect(getVisibleDialog(renderer)?.title).toBe('Solicitare înregistrată');

  await unmount();
});

test('resending validates the email and preserves the old code on failure', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <ResetPasswordPanel initialEmail={email} onPasswordReset={jest.fn()} />,
  );
  await fill(renderer, { email: 'email@', code: '111111' });
  await press(renderer, 'Retrimite codul');
  expect(globalThis.fetch).not.toHaveBeenCalled();
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Completează un email valid.',
  );

  jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(429, {}));
  await fill(renderer, { email });
  await press(renderer, 'Retrimite codul');
  expect(getVisibleDialog(renderer)?.title).toBe('Eroare');
  expect(field(renderer, 'code').props.value).toBe('111111');

  await unmount();
});

test('password visibility is independent and mismatching confirmation never reaches the API', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <ResetPasswordPanel initialEmail={email} onPasswordReset={jest.fn()} />,
  );
  await fill(renderer, {
    code: '123456',
    password,
    password_confirmation: 'AltaParola123',
  });
  await press(renderer, 'Arată confirmarea parolei');
  expect(field(renderer, 'password').props.secureTextEntry).toBe(true);
  expect(field(renderer, 'password_confirmation').props.secureTextEntry).toBe(
    false,
  );
  await press(renderer, 'Arată parola');
  await press(renderer, 'Ascunde confirmarea parolei');
  expect(field(renderer, 'password').props.secureTextEntry).toBe(false);
  expect(field(renderer, 'password_confirmation').props.secureTextEntry).toBe(
    true,
  );
  await press(renderer, 'Resetează parola');
  expect(globalThis.fetch).not.toHaveBeenCalled();
  expect(JSON.stringify(renderer.toJSON())).toContain('Parolele nu coincid.');

  await unmount();
});
