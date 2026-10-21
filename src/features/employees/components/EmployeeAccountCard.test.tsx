import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeAccountCard } from '@/features/employees/components/EmployeeAccountCard';
import { EmployeeProfile } from '@/features/employees/types';
import { formatDateTime } from '@/shared/utils/formatDate';
import {
  getVisibleDialog,
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('admin-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const profile: EmployeeProfile = {
  id: 'employee-1',
  name: 'Animator',
  gender: 'male',
  hourly_rate: 100,
  birth_date: '1995-05-10',
  is_active: true,
  created_at: '2026-01-01',
  total_earnings: 0,
  events: [],
  account: { status: 'not_invited', email: null, expires_at: null },
};

beforeEach(() => {
  const invitation = {
    status: 'pending',
    email: 'animator@example.com',
    expires_at: '2026-09-25T12:15:00+03:00',
  };
  globalThis.fetch = jest.fn(url => String(url).endsWith('/me')
    ? Promise.resolve(jsonResponse(200, {
      id: 'admin-1', name: 'Admin', email: 'admin@example.com',
      role: 'admin', employee_id: null,
    }))
    : Promise.resolve(jsonResponse(200, invitation))) as unknown as typeof globalThis.fetch;
});

test('admin sends an invitation from the employee profile', async () => {
  const { renderer, unmount } = await renderWithProviders(<EmployeeAccountCard profile={profile} />);

  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: 'Trimite invitație' }).props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: 'Adresa de email' }).props.onChangeText('animator@example.com');
  });
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: 'Trimite codul' }).props.onPress();
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/employees/employee-1/invitation'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'animator@example.com' }),
    }),
  );
  expect(getVisibleDialog(renderer)?.message).toBe(
    `Codul trimis la animator@example.com expiră la ${formatDateTime('2026-09-25T12:15:00+03:00')}.`,
  );
  await unmount();
});
