import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { BookingPayments } from '@/features/bookings/components/BookingPayments';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
  pressDialogButton,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
const payment: BookingPayment = {
  id: 'payment-1',
  event_id: 'event-1',
  version: 1,
  type: 'incoming',
  category: 'advance',
  amount: 100,
  paid_at: '2027-11-01',
  method: 'cash',
  status: 'completed',
  notes: '',
};

test('păstrează ciorna plății la 409 și înlocuiește versiunea numai după confirmarea reîncărcării', async () => {
  let puts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'PUT') {
      puts += 1;
      return Promise.resolve(
        puts === 1
          ? jsonResponse(409, { error: { code: 'RESOURCE_VERSION_CONFLICT' } })
          : jsonResponse(200, { ...payment, version: 3, amount: 300 }),
      );
    }
    return Promise.resolve(
      jsonResponse(200, { ...payment, version: 2, amount: 300 }),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <BookingPaymentForm
      eventId="event-1"
      payment={payment}
      onClose={() => undefined}
    />,
  );
  try {
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Sumă (lei)' })
        .props.onChangeText('200');
    });
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Salvează plata' })
        .props.onPress();
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(VersionConflictNotice)).toHaveLength(
        1,
      ),
    );
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Sumă (lei)' }).props
        .value,
    ).toBe('200');
    await pressDialogButton(renderer, 'OK');
    const button = () =>
      renderer.root
        .findAllByType(AppButton)
        .find(node => node.props.label === 'Încarcă versiunea curentă');
    await ReactTestRenderer.act(async () => {
      button()?.props.onPress();
    });
    await pressDialogButton(renderer, 'Anulează');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Sumă (lei)' }).props
        .value,
    ).toBe('200');
    await ReactTestRenderer.act(async () => {
      button()?.props.onPress();
    });
    await pressDialogButton(renderer, 'Încarcă');
    await waitForUi(() =>
      expect(
        renderer.root.findByProps({ accessibilityLabel: 'Sumă (lei)' }).props
          .value,
      ).toBe('300'),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Salvează plata' })
        .props.onPress();
    });
    const bodies = jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(([, init]) => init?.method === 'PUT')
      .map(([, init]) => JSON.parse(String(init?.body)));
    expect(bodies.map(body => body.version)).toEqual([1, 2]);
  } finally {
    await unmount();
  }
});

test('reîncarcă lista după conflictul anulării fără a retrimite anularea automat', async () => {
  let conflicted = false;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'DELETE') {
      conflicted = true;
      return Promise.resolve(
        jsonResponse(409, { error: { code: 'RESOURCE_VERSION_CONFLICT' } }),
      );
    }
    return Promise.resolve(
      paginatedResponse([{ ...payment, version: conflicted ? 2 : 1 }]),
    );
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <BookingPayments eventId="event-1" />,
  );
  try {
    await waitForUi(() =>
      expect(
        renderer.root
          .findAllByType(AppButton)
          .some(node => node.props.label === 'Anulează plata'),
      ).toBe(true),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(AppButton)
        .find(node => node.props.label === 'Anulează plata')
        ?.props.onPress();
    });
    await pressDialogButton(renderer, 'Anulează plata');
    await waitForUi(() =>
      expect(renderer.root.findAllByType(VersionConflictNotice)).toHaveLength(
        1,
      ),
    );
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.filter(([, init]) => init?.method === 'DELETE'),
    ).toHaveLength(1);
    await waitForUi(() =>
      expect(
        jest
          .mocked(globalThis.fetch)
          .mock.calls.filter(([url]) => String(url).includes('/payments?'))
          .length,
      ).toBeGreaterThan(1),
    );
  } finally {
    await unmount();
  }
});
