import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthProvider';
import { useBookingSubmission } from '@/features/bookings/hooks/useBookingSubmission';
import { bookingEditorSchema } from '@/features/bookings/schemas/bookingEditorSchema';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { forgetBookingCreationAttempt } from '@/features/bookings/utils/bookingCreationRecovery';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { BookingAdvanceFields } from '@/features/bookings/components/BookingAdvanceFields';
import {
  owner,
  press,
} from '@/features/bookings/hooks/bookingSubmission.testUtils';
import { AppButton } from '@/shared/components/AppButton';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { companyNow } from '@/shared/utils/formatDate';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function Probe({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingEditorSchema()),
    defaultValues: {
      ...bookingFormDefaults(
        plannerBooking.date,
        plannerBooking.hall_id,
        plannerBooking,
      ),
      client_phone: '0724111001',
      advance_received_amount: '1000,50',
      advance_received_method: 'card',
    },
  });
  const save = useBookingSubmission({
    form,
    owner,
    staffEnabled: false,
    validatePhone: () => true,
    onClose,
    onErrorStep: () => undefined,
    onConflict: () => undefined,
  });
  return (
    <>
      <BookingAdvanceFields form={form} financeEnabled />
      <AppButton
        label="Salvează"
        onPress={save.submit}
        disabled={!user || save.isPending}
      />
    </>
  );
}

test('salvarea rezervării trimite o singură intenție de încasare după pierderea răspunsului', async () => {
  const bodies: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((_url, init) => {
    if (init?.method !== 'POST')
      return Promise.resolve(jsonResponse(200, plannerAccount));
    bodies.push(JSON.parse(String(init.body)));
    return bodies.length === 1
      ? Promise.reject(new Error('Raspuns pierdut'))
      : Promise.resolve(jsonResponse(201, plannerBooking));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const view = await renderWithProviders(<Probe onClose={onClose} />);
  try {
    await waitForUi(() =>
      expect(
        view.renderer.root.findByProps({ accessibilityLabel: 'Salvează' }).props
          .disabled,
      ).toBe(false),
    );
    await press(view.renderer, 'Salvează');
    await waitForUi(() => expect(bodies).toHaveLength(1));
    await pressDialogButton(view.renderer, 'OK');
    await press(view.renderer, 'Salvează');
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(bodies[1]).toEqual(bodies[0]);
    expect(bodies[0].advance_receipt).toEqual({
      operation_id: expect.any(String),
      amount: '1000.50',
      method: 'card',
      paid_at: companyNow().format('YYYY-MM-DD'),
    });
  } finally {
    forgetBookingCreationAttempt(owner);
    await view.unmount();
  }
});
