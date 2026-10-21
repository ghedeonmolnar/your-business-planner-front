import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeRegistrationPanel } from '@/features/auth/components/EmployeeRegistrationPanel';
import { getAuthToken } from '@/shared/storage/authTokenStorage';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

beforeEach(() => {
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
