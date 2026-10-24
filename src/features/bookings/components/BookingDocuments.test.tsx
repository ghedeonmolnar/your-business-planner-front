import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingDocuments } from '@/features/bookings/components/BookingDocuments';
import { AppButton } from '@/shared/components/AppButton';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  paginatedResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
const document = {
  id: 'document-1',
  event_id: 'event-1',
  version: 1,
  document_type: 'contract',
  title: 'Contract',
  original_name: 'a.txt',
  size_bytes: 10,
};

test('păstrează metadatele nesalvate la conflict și trimite noua versiune numai după reîncărcarea confirmată', async () => {
  let puts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'PUT') {
      puts += 1;
      return Promise.resolve(
        puts === 1
          ? jsonResponse(409, { error: { code: 'RESOURCE_VERSION_CONFLICT' } })
          : jsonResponse(200, { ...document, version: 3 }),
      );
    }
    if (path.endsWith('/event-documents/document-1'))
      return Promise.resolve(
        jsonResponse(200, { ...document, version: 2, title: 'Colegul' }),
      );
    return Promise.resolve(
      paginatedResponse([
        {
          ...document,
          version: puts ? 2 : 1,
          title: puts ? 'Colegul' : 'Contract',
        },
      ]),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <BookingDocuments eventId="event-1" />,
  );
  const press = async (label: string) =>
    ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(AppButton)
        .find(node => node.props.label === label)
        ?.props.onPress();
    });
  try {
    await waitForUi(() =>
      expect(
        renderer.root
          .findAllByType(AppButton)
          .some(node => node.props.label === 'Editează'),
      ).toBe(true),
    );
    await press('Editează');
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Titlu' })
        .props.onChangeText('Ciorna mea');
    });
    await press('Salvează');
    await waitForUi(() =>
      expect(renderer.root.findAllByType(VersionConflictNotice)).toHaveLength(
        1,
      ),
    );
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Titlu' }).props.value,
    ).toBe('Ciorna mea');
    await pressDialogButton(renderer, 'OK');
    await press('Încarcă versiunea curentă');
    await pressDialogButton(renderer, 'Anulează');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Titlu' }).props.value,
    ).toBe('Ciorna mea');
    await press('Încarcă versiunea curentă');
    await pressDialogButton(renderer, 'Încarcă');
    await waitForUi(() =>
      expect(
        renderer.root.findByProps({ accessibilityLabel: 'Titlu' }).props.value,
      ).toBe('Colegul'),
    );
    await press('Salvează');
    const bodies = jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(([, init]) => init?.method === 'PUT')
      .map(([, init]) => JSON.parse(String(init?.body)));
    expect(bodies.map(body => body.version)).toEqual([1, 2]);
  } finally {
    await unmount();
  }
});
