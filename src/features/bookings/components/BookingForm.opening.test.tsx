import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Modal } from 'react-native';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { LoadingState } from '@/shared/components/LoadingState';
import { loadBookingCreationJournal } from '@/features/bookings/utils/bookingCreationJournal';
import { loadPaymentOperations } from '@/features/bookings/utils/paymentOperationJournal';
import { forgetBookingCreationAttempt } from '@/features/bookings/utils/bookingCreationRecovery';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import { waitForUi } from '@/shared/test/waitForUi';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/features/bookings/utils/bookingCreationJournal', () => ({
  ...jest.requireActual('@/features/bookings/utils/bookingCreationJournal'),
  loadBookingCreationJournal: jest.fn(),
}));
jest.mock('@/features/bookings/utils/paymentOperationJournal', () => ({
  ...jest.requireActual('@/features/bookings/utils/paymentOperationJournal'),
  loadPaymentOperations: jest.fn(),
}));

beforeEach(() => {
  forgetBookingCreationAttempt(
    JSON.stringify([plannerAccount.company?.id, plannerAccount.id]),
  );
  jest
    .mocked(loadBookingCreationJournal)
    .mockReset()
    .mockResolvedValue(undefined);
  jest.mocked(loadPaymentOperations).mockReset().mockResolvedValue([]);
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, plannerAccount)
        : String(url).endsWith('/catalogs')
          ? jsonResponse(200, catalogsFixture)
          : paginatedResponse([]),
    ),
  ) as typeof globalThis.fetch;
});

test.each(['booking', 'payment'] as const)(
  '%s așteaptă jurnalul fără modal și deschide direct formularul final',
  async kind => {
    let finishLoading: (() => void) | undefined;
    const pending = new Promise<void>(resolve => {
      finishLoading = resolve;
    });
    if (kind === 'booking')
      jest
        .mocked(loadBookingCreationJournal)
        .mockReturnValue(pending.then(() => undefined));
    else
      jest
        .mocked(loadPaymentOperations)
        .mockReturnValue(pending.then(() => []));
    const { renderer, unmount } = await renderWithProviders(
      kind === 'booking' ? (
        <BookingForm date="2027-11-13" onClose={() => undefined} />
      ) : (
        <BookingPaymentForm eventId="event-1" onClose={() => undefined} />
      ),
    );
    try {
      await waitForUi(() =>
        expect(
          kind === 'booking'
            ? loadBookingCreationJournal
            : loadPaymentOperations,
        ).toHaveBeenCalled(),
      );
      expect(renderer.root.findAllByType(FormModalFrame)).toHaveLength(0);
      expect(renderer.root.findAllByType(LoadingState).length).toBeGreaterThan(
        0,
      );
      expect(
        renderer.root.findAllByType(Modal).filter(node => node.props.visible),
      ).toHaveLength(0);
      await ReactTestRenderer.act(async () => {
        finishLoading?.();
        await pending;
      });
      await waitForUi(() =>
        expect(renderer.root.findAllByType(FormModalFrame)).toHaveLength(1),
      );
      expect(renderer.root.findByType(FormModalFrame).props.title).toBe(
        kind === 'booking' ? 'Sală și program' : 'Încasare sau cheltuială',
      );
      expect(
        renderer.root.findAllByType(Modal).filter(node => node.props.visible),
      ).toHaveLength(1);
    } finally {
      finishLoading?.();
      await unmount();
    }
  },
);

test.each(['booking', 'payment'] as const)(
  '%s la editare nu așteaptă jurnalul unei creări',
  async kind => {
    let finishLoading: (() => void) | undefined;
    const pending = new Promise<void>(resolve => {
      finishLoading = resolve;
    });
    jest
      .mocked(loadBookingCreationJournal)
      .mockReturnValue(pending.then(() => undefined));
    jest.mocked(loadPaymentOperations).mockReturnValue(pending.then(() => []));
    const { renderer, unmount } = await renderWithProviders(
      kind === 'booking' ? (
        <BookingForm
          date={plannerBooking.date}
          booking={plannerBooking}
          onClose={() => undefined}
        />
      ) : (
        <BookingPaymentForm
          eventId="event-1"
          payment={{
            id: 'payment-1',
            version: 1,
            event_id: 'event-1',
            type: 'incoming',
            category: 'advance',
            amount: 1000,
            paid_at: '2027-11-13',
            status: 'completed',
          }}
          onClose={() => undefined}
        />
      ),
    );
    try {
      if (kind === 'booking')
        expect(loadBookingCreationJournal).not.toHaveBeenCalled();
      expect(renderer.root.findByType(FormModalFrame).props.title).toBe(
        kind === 'booking' ? 'Sală și program' : 'Editează plata',
      );
      expect(
        renderer.root.findAllByType(Modal).filter(node => node.props.visible),
      ).toHaveLength(1);
    } finally {
      finishLoading?.();
      await unmount();
    }
  },
);
