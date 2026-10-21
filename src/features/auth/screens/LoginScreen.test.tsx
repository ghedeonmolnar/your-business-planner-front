import React from 'react';
import { Animated } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput as TextField } from 'react-native-paper';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { getAuthToken } from '@/shared/storage/authTokenStorage';
import {
  getVisibleDialog,
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

const fillLoginForm = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  username: string,
  password: string,
) => {
  const fields = renderer.root.findAllByProps({ accessibilityLabel: 'Parolă' });
  const usernameField = renderer.root.findAllByProps({
    accessibilityLabel: 'Email',
  })[0];

  await ReactTestRenderer.act(async () => {
    usernameField.props.onChangeText(username);
    fields[0].props.onChangeText(password);
  });
};

const pressButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const button = renderer.root.findByProps({ accessibilityLabel: label });

  await ReactTestRenderer.act(async () => {
    await button.props.onPress();
  });
};

const submitLogin = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  pressButton(renderer, 'Intră în aplicație');

beforeEach(() => {
  globalThis.fetch = jest.fn();
  jest.spyOn(Animated, 'loop').mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  } as unknown as Animated.CompositeAnimation);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('stores the session token after a successful login', async () => {
  jest
    .mocked(globalThis.fetch)
    .mockResolvedValue(jsonResponse(200, { token: 'token-de-test' }));

  const { renderer, unmount } = await renderWithProviders(<LoginScreen />);

  await fillLoginForm(renderer, 'gigi@godlyhub.com', 'parola-buna');
  await submitLogin(renderer);

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/login'),
    expect.objectContaining({ method: 'POST' }),
  );
  await expect(getAuthToken()).resolves.toBe('token-de-test');

  await unmount();
});

test('maps the credentials error code to the Romanian message', async () => {
  jest
    .mocked(globalThis.fetch)
    .mockResolvedValue(
      jsonResponse(422, { error: { code: 'AUTH_INVALID_CREDENTIALS' } }),
    );

  const { renderer, unmount } = await renderWithProviders(<LoginScreen />);

  await fillLoginForm(renderer, 'gigi@godlyhub.com', 'parola-gresita');
  await submitLogin(renderer);

  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Eroare',
    message: 'Datele de autentificare sunt incorecte.',
  });

  await unmount();
});

test('sends exactly the password typed while the field is hidden', async () => {
  jest
    .mocked(globalThis.fetch)
    .mockResolvedValue(
      jsonResponse(422, { message: 'Date de autentificare greșite.' }),
    );

  const { renderer, unmount } = await renderWithProviders(<LoginScreen />);
  const passwordField = () =>
    renderer.root
      .findAllByType(TextField)
      .find(field => field.props.accessibilityLabel === 'Parolă');

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByProps({ accessibilityLabel: 'Email' })[0]
      .props.onChangeText('animator@example.com');
  });

  for (const value of ['t', 'te', 'tes']) {
    await ReactTestRenderer.act(async () => {
      passwordField()?.props.onChangeText(value);
    });
  }

  expect(passwordField()?.props.secureTextEntry).toBe(true);
  expect(passwordField()?.props.value).toBe('tes');
  await pressButton(renderer, 'Arată parola');
  expect(passwordField()?.props.secureTextEntry).toBe(false);
  expect(passwordField()?.props.value).toBe('tes');
  await pressButton(renderer, 'Ascunde parola');
  expect(passwordField()?.props.secureTextEntry).toBe(true);

  await submitLogin(renderer);

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/login'),
    expect.objectContaining({
      body: JSON.stringify({
        username: 'animator@example.com',
        password: 'tes',
      }),
    }),
  );

  await unmount();
});

test('carries the typed email from login to the reset code form', async () => {
  jest
    .mocked(globalThis.fetch)
    .mockResolvedValue(
      jsonResponse(200, { message: 'Ți-am trimis codul pe email.' }),
    );

  const { renderer, unmount } = await renderWithProviders(<LoginScreen />);

  await fillLoginForm(renderer, 'gigi@godlyhub.com', '');
  await pressButton(renderer, 'Ai uitat parola?');
  await pressButton(renderer, 'Trimite cod');

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/password/forgot'),
    expect.objectContaining({
      body: JSON.stringify({ email: 'gigi@godlyhub.com' }),
    }),
  );
  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Cod trimis',
    message: 'Dacă adresa există, ți-am trimis un cod de resetare pe email.',
  });
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Cod' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Email' })[0].props
      .value,
  ).toBe('gigi@godlyhub.com');

  await unmount();
});
