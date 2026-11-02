import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { EmployeeRegistrationPanel } from '@/features/auth/components/EmployeeRegistrationPanel';
import {
  clearAuthToken,
  getAuthToken,
} from '@/shared/storage/authTokenStorage';
import {
  getVisibleDialog,
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

beforeEach(async () => {
  await clearAuthToken();
  globalThis.fetch = jest.fn().mockResolvedValue(
    jsonResponse(201, {
      token: 'employee-token',
      user: {
        id: 'user-1',
        name: 'Animator',
        email: 'animator@example.com',
        role: 'employee',
        employee_id: 'employee-1',
      },
    }),
  );
});

test('registers only with the invitation code and stores the new session', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeRegistrationPanel onBack={jest.fn()} />,
  );

  for (const [label, value] of [
    ['Email', 'animator@example.com'],
    ['Cod invitație', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    ['Parolă', 'ParolaAngajat123'],
    ['Confirmă parola', 'ParolaAngajat123'],
  ]) {
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: label })
        .props.onChangeText(value);
    });
  }

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Creează contul' })
      .props.onPress();
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/invitations/accept'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        email: 'animator@example.com',
        code: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        password: 'ParolaAngajat123',
        password_confirmation: 'ParolaAngajat123',
      }),
    }),
  );
  await expect(getAuthToken()).resolves.toBe('employee-token');
  await unmount();
});

test('an invalid or expired invitation offers a new invitation and a return to login', async () => {
  jest.mocked(globalThis.fetch).mockResolvedValue(
    jsonResponse(422, {
      error: { code: 'INVITATION_INVALID' },
      message: 'Private backend diagnostic',
    }),
  );
  const onBack = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeRegistrationPanel onBack={onBack} />,
  );

  for (const [name, value] of Object.entries({
    email: 'cont@example.com',
    code: 'A'.repeat(40),
    password: 'ParolaNoua123',
    password_confirmation: 'ParolaNoua123',
  })) {
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(TextInput)
        .find(input => input.props.testID === `input:${name}`)!
        .props.onChangeText(value);
    });
  }
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: 'Creează contul' })
      .props.onPress();
  });

  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Invitație invalidă sau expirată',
    message:
      'Codul de invitație este invalid sau expirat. Solicită o invitație nouă de la administratorul companiei.',
    confirmLabel: 'Am înțeles',
    cancelLabel: 'Înapoi la autentificare',
    icon: 'ticket-outline',
    tone: 'warning',
    centered: true,
  });
  expect(onBack).not.toHaveBeenCalled();
  await pressDialogButton(renderer, 'Înapoi la autentificare');
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(getVisibleDialog(renderer)).toBeNull();
  await expect(getAuthToken()).resolves.toBeNull();

  await unmount();
});

test('revealing the confirmation leaves the invitation password hidden', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <EmployeeRegistrationPanel onBack={jest.fn()} />,
  );
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: 'Arată confirmarea parolei' })
      .props.onPress();
  });
  const fields = renderer.root.findAllByType(TextInput);
  expect(
    fields.find(input => input.props.testID === 'input:password')?.props
      .secureTextEntry,
  ).toBe(true);
  expect(
    fields.find(input => input.props.testID === 'input:password_confirmation')
      ?.props.secureTextEntry,
  ).toBe(false);
  expect(globalThis.fetch).not.toHaveBeenCalled();

  await unmount();
});
