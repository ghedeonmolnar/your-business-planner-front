import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const press = (renderer: ReactTestRenderer.ReactTestRenderer, label: string) =>
  ReactTestRenderer.act(async () =>
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress(),
  );

test('conflictul de personal pastreaza ciorna si reincarca explicit rolul, tariful si arhivarea curenta', async () => {
  const original = {
    id: 'employee-1',
    version: 1,
    name: 'Initial',
    job_role: 'waiter',
    hourly_rate: 40,
    is_active: true,
  };
  const current = {
    ...original,
    version: 2,
    name: 'Nume curent',
    job_role: 'cook',
    hourly_rate: 75,
    is_active: false,
  };
  const writes: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'PUT') {
      writes.push(JSON.parse(String(init.body)));
      return Promise.resolve(
        writes.length === 1
          ? jsonResponse(409, { error: { code: 'RESOURCE_VERSION_CONFLICT' } })
          : jsonResponse(200, { ...current, version: 3 }),
      );
    }
    return Promise.resolve(jsonResponse(200, current));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const view = await renderWithProviders(
    <DirectoryForm kind="employees" item={original} onClose={onClose} />,
  );
  try {
    await ReactTestRenderer.act(async () =>
      view.renderer.root
        .findByProps({ accessibilityLabel: 'Nume' })
        .props.onChangeText('Ciorna mea'),
    );
    await press(view.renderer, 'Salvează');
    await waitForUi(() => expect(writes).toHaveLength(1));
    await pressDialogButton(view.renderer, 'OK');
    expect(
      view.renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props
        .value,
    ).toBe('Ciorna mea');
    expect(
      view.renderer.root.findByProps({ accessibilityLabel: 'Salvează' }).props
        .disabled,
    ).toBe(true);
    await press(view.renderer, 'Încarcă versiunea curentă');
    await pressDialogButton(view.renderer, 'Anulează');
    expect(
      view.renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props
        .value,
    ).toBe('Ciorna mea');
    await press(view.renderer, 'Încarcă versiunea curentă');
    await pressDialogButton(view.renderer, 'Încarcă');
    await waitForUi(() =>
      expect(
        view.renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props
          .value,
      ).toBe('Nume curent'),
    );
    await press(view.renderer, 'Salvează');
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(writes[0]).toMatchObject({
      version: 1,
      name: 'Ciorna mea',
      is_active: true,
    });
    expect(writes[1]).toMatchObject({
      version: 2,
      name: 'Nume curent',
      job_role: 'cook',
      hourly_rate: '75',
      is_active: false,
    });
  } finally {
    await view.unmount();
  }
});
