import React, { useState } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  getVisibleDialog,
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

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });
};

const change = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onChangeText(value);
  });
};

test('o ciorna veche ramane vizibila pana la reincarcarea explicita a clientului', async () => {
  const original = {
    id: 'client-1',
    version: 1,
    name: 'Initial',
    notes: 'Nota initiala',
    phone: null,
  };
  const current = {
    ...original,
    version: 2,
    name: 'Nume curent',
    notes: 'Nota curenta',
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
          : jsonResponse(200, { ...current, ...writes.at(-1), version: 3 }),
      );
    }
    return Promise.resolve(jsonResponse(200, current));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <DirectoryForm kind="clients" item={original} onClose={onClose} />,
  );
  try {
    await change(renderer, 'Nume', 'Ciorna mea');
    await press(renderer, 'Salvează');
    await waitForUi(() => expect(getVisibleDialog(renderer)).not.toBeNull());
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props.value,
    ).toBe('Ciorna mea');
    expect(onClose).not.toHaveBeenCalled();
    await pressDialogButton(renderer, 'OK');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Salvează' }).props
        .disabled,
    ).toBe(true);
    await press(renderer, 'Încarcă versiunea salvată');
    await pressDialogButton(renderer, 'Încarcă versiunea');
    await waitForUi(() =>
      expect(
        renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props.value,
      ).toBe('Nume curent'),
    );
    await change(renderer, 'Discuții și observații', 'Nota verificata');
    await press(renderer, 'Salvează');
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(writes[1]).toMatchObject({
      version: 2,
      name: 'Nume curent',
      notes: 'Nota verificata',
    });
  } finally {
    await unmount();
  }
});

function ReopenableClientForm() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <AppButton label="Toggle" onPress={() => setOpen(value => !value)} />
      {open ? (
        <DirectoryForm kind="clients" onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

test('redeschiderea dupa un raspuns pierdut retrimite aceeasi creare fara telefon', async () => {
  const writes: Record<string, unknown>[] = [];
  let finishFirst: ((response: Response) => void) | undefined;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    writes.push(JSON.parse(String(init?.body)));
    if (writes.length === 1)
      return new Promise<Response>(resolve => {
        finishFirst = resolve;
      });
    return Promise.resolve(
      jsonResponse(201, {
        id: 'created-client',
        version: 1,
        name: 'Client fara telefon',
        phone: null,
      }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <ReopenableClientForm />,
  );
  try {
    await change(renderer, 'Nume', 'Client fara telefon');
    await press(renderer, 'Salvează');
    await waitForUi(() => expect(writes).toHaveLength(1));
    await press(renderer, 'Toggle');
    await press(renderer, 'Toggle');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props.value,
    ).toBe('Client fara telefon');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props.disabled,
    ).toBe(true);
    await ReactTestRenderer.act(async () => {
      finishFirst?.(jsonResponse(500, { error: { code: 'SERVER_ERROR' } }));
    });
    if (getVisibleDialog(renderer)) await pressDialogButton(renderer, 'OK');
    await press(renderer, 'Salvează');
    await waitForUi(() => expect(writes).toHaveLength(2));
    expect(writes[1]).toEqual(writes[0]);
    expect(writes[1].operation_id).toMatch(/^[0-9a-f-]{36}$/i);
  } finally {
    await unmount();
  }
});
