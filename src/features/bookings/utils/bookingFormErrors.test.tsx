import {
  firstBookingErrorStep,
  bookingStepFields,
  applyBookingApiErrors,
} from '@/features/bookings/utils/bookingFormErrors';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { bookingFormSchema } from '@/features/bookings/schemas/bookingFormSchema';
import { ApiError } from '@/shared/api/apiError';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useForm, UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('alege pasul câmpului invalid și ajustează indicii fără modulul de personal', () => {
  expect(firstBookingErrorStep({ menu_name: { type: 'max' } }, true)).toBe(2);
  expect(firstBookingErrorStep({ notes: { type: 'max' } }, true)).toBe(4);
  expect(firstBookingErrorStep({ notes: { type: 'max' } }, false)).toBe(3);
  expect(bookingStepFields(false)).toHaveLength(4);
});

test.each([
  ['minimum_guests', '100000', '100001'],
  ['menu_price', '99999999.99', '100000000'],
  ['menu_name', 'a'.repeat(255), 'a'.repeat(256)],
  ['notes', 'a'.repeat(20000), 'a'.repeat(20001)],
])('aliniază limita API pentru %s', (field, valid, invalid) => {
  const values = bookingFormDefaults(
    plannerBooking.date,
    plannerBooking.hall_id,
    plannerBooking,
  );
  expect(
    bookingFormSchema.safeParse({ ...values, [field]: valid }).success,
  ).toBe(true);
  expect(
    bookingFormSchema.safeParse({ ...values, [field]: invalid }).success,
  ).toBe(false);
});

test('mapează câmpul 422 din envelope fără a afișa textul tehnic al serverului', async () => {
  const holder: { form?: UseFormReturn<BookingFormValues> } = {};
  function Probe() {
    holder.form = useForm<BookingFormValues>({
      defaultValues: bookingFormDefaults(
        plannerBooking.date,
        plannerBooking.hall_id,
        plannerBooking,
      ),
    });
    return null;
  }
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  const form = holder.form;
  if (!form) throw new Error('Formular indisponibil');
  let step: number | null = null;
  await ReactTestRenderer.act(async () => {
    step = applyBookingApiErrors(
      new ApiError('Validare', 422, {
        response: {
          errors: {
            menu_name: ['TECHNICAL_SECRET'],
            unknown_field: ['TECHNICAL_SECRET'],
          },
        },
      }),
      form,
      true,
    );
  });
  expect(step).toBe(2);
  expect(form.getFieldState('menu_name').error?.message).not.toContain(
    'TECHNICAL_SECRET',
  );
  expect(form.getFieldState('menu_name').error?.type).toBe('server');
  expect(
    applyBookingApiErrors(
      new ApiError('Validare', 422, {
        response: { errors: { unknown: ['TECHNICAL_SECRET'] } },
      }),
      form,
      true,
    ),
  ).toBeNull();
  await ReactTestRenderer.act(async () => {
    step = applyBookingApiErrors(
      new ApiError('Validare', 422, {
        response: { error: { code: 'BOOKING_CLIENT_PHONE_REQUIRED' } },
      }),
      form,
      true,
    );
  });
  expect(step).toBe(1);
  expect(form.getFieldState('client_phone').error?.message).toBe(
    'Completează telefonul clientului înainte de rezervare.',
  );
  await ReactTestRenderer.act(async () => {
    step = applyBookingApiErrors(
      new ApiError('Validare', 422, {
        response: { error: { code: 'BOOKING_CHILD_MENU_PRICE_REQUIRED' } },
      }),
      form,
      true,
    );
  });
  expect(step).toBe(2);
  expect(form.getFieldState('child_menu_price').error?.message).toBe(
    'Completează prețul meniului pentru copii.',
  );
  await ReactTestRenderer.act(async () => {
    step = applyBookingApiErrors(
      new ApiError('Validare', 422, {
        response: { errors: { date: ['BOOKING_DATE_IN_PAST'] } },
      }),
      form,
      true,
    );
  });
  expect(step).toBe(0);
  expect(form.getFieldState('date').error?.message).toBe(
    'Alege ziua de azi sau o dată viitoare.',
  );
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
