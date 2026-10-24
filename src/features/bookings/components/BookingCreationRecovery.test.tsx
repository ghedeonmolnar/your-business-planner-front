import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import {
  forgetBookingCreationAttempt,
  rememberBookingCreationAttempt,
} from '@/features/bookings/utils/bookingCreationRecovery';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { catalogsFixture } from '@/shared/test/apiFixtures';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('recuperează aceeași creare la redeschidere după pierderea răspunsului', async () => {
  const owner = JSON.stringify([plannerAccount.company?.id, plannerAccount.id]);
  const values = bookingFormDefaults(
    plannerBooking.date,
    plannerBooking.hall_id,
    plannerBooking,
  );
  const payload = {
    ...bookingPayload(values),
    operation_id: '35970304-2927-4e5f-9b4c-c8b0f0f833f1',
  };
  rememberBookingCreationAttempt(owner, { values, payload });
  let posts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (init?.method === 'POST') {
      posts += 1;
      return posts === 1
        ? Promise.reject(new Error('Răspuns pierdut'))
        : Promise.resolve(jsonResponse(201, plannerBooking));
    }
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
  const first = await renderWithProviders(
    <BookingForm date="2027-11-13" onClose={() => undefined} />,
  );
  const submit = async (renderer: ReactTestRenderer.ReactTestRenderer) =>
    ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Salvează rezervarea' })
        .props.onPress();
    });
  try {
    await waitForUi(() =>
      expect(first.renderer.root.findAllByType(FormModalFrame)).toHaveLength(1),
    );
    expect(first.renderer.root.findByType(FormModalFrame).props.readOnly).toBe(
      true,
    );
    await submit(first.renderer);
  } finally {
    await first.unmount();
  }
  const onClose = jest.fn();
  const second = await renderWithProviders(
    <BookingForm date="2027-12-01" onClose={onClose} />,
  );
  try {
    await waitForUi(() =>
      expect(second.renderer.root.findAllByType(FormModalFrame)).toHaveLength(
        1,
      ),
    );
    await submit(second.renderer);
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    const bodies = jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(([, init]) => init?.method === 'POST')
      .map(([, init]) => JSON.parse(String(init?.body)));
    expect(bodies).toEqual([payload, payload]);
  } finally {
    await second.unmount();
    forgetBookingCreationAttempt(owner);
  }
});
