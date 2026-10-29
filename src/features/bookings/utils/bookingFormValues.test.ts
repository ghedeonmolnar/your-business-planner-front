import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import {
  bookingFormSchema,
  BookingFormValues,
} from '@/features/bookings/schemas/bookingFormSchema';

test('precompletează prețurile sălii și păstrează condițiile istorice la editare', () => {
  const hall = {
    minimum_guests: 100,
    menu_price: '350.25',
    child_menu_price: '150.50',
  };
  const fresh = bookingFormDefaults('2027-11-13', 'hall-1', undefined, hall);
  expect(fresh).toMatchObject({
    minimum_guests: '100',
    estimated_guests: '100',
    menu_price: '350.25',
    child_guests: '',
    child_menu_price: '150.50',
    final_guests: '',
  });
  const original = {
    ...plannerBooking,
    minimum_guests: 80,
    estimated_guests: 120,
    menu_price: '300.00',
    child_guests: 5,
    child_menu_price: '100.00',
  };
  expect(
    bookingFormDefaults(original.date, original.hall_id, original, hall),
  ).toMatchObject({
    minimum_guests: '80',
    estimated_guests: '120',
    menu_price: '300.00',
    child_guests: '5',
    child_menu_price: '100.00',
  });
});

test('confirmarea și copiii sunt opționali, iar payloadul păstrează precizia prețului', () => {
  const values = {
    ...bookingFormDefaults('2027-11-13', 'hall-1'),
    client_id: 'client-1',
    estimated_guests: '120',
    child_menu_price: '150,25',
  };
  expect(bookingPayload(values)).toMatchObject({
    estimated_guests: 120,
    final_guests: null,
    child_guests: null,
    child_menu_price: '150.25',
  });
  expect(
    bookingPayload({ ...values, final_guests: '110', child_guests: '10' }),
  ).toMatchObject({ final_guests: 110, child_guests: 10 });
  const legacy: BookingFormValues = { ...values };
  delete legacy.estimated_guests;
  delete legacy.child_guests;
  delete legacy.child_menu_price;
  const payload = JSON.parse(JSON.stringify(bookingPayload(legacy)));
  expect(payload).not.toHaveProperty('estimated_guests');
  expect(payload).not.toHaveProperty('child_guests');
  expect(payload).not.toHaveProperty('child_menu_price');
});

test('clientul nou cere numai telefonul, iar numele este opțional în payload', () => {
  const values = {
    ...bookingFormDefaults('2027-11-13', 'hall-1'),
    client_phone: '0724 111 001',
  };
  expect(bookingFormSchema.safeParse(values).success).toBe(true);
  expect(bookingPayload(values)).toMatchObject({
    client_id: undefined,
    client_phone: '+40724111001',
    client_name: undefined,
  });
  expect(
    bookingPayload({ ...values, client_name: '  Ana Popescu  ' }).client_name,
  ).toBe('Ana Popescu');
  expect(
    bookingFormSchema.safeParse({ ...values, client_phone: 'invalid' }).success,
  ).toBe(false);
  expect(
    bookingFormSchema.safeParse({ ...values, client_phone: '' }).success,
  ).toBe(false);
});

test('editarea păstrează clientul istoric dacă telefonul este neschimbat', () => {
  const values = bookingFormDefaults(
    plannerBooking.date,
    plannerBooking.hall_id,
    plannerBooking,
  );
  const payload = bookingPayload(values, plannerBooking);
  expect(payload.client_id).toBe(plannerBooking.client_id);
  expect(payload.client_phone).toBeUndefined();
  const changed = bookingPayload(
    { ...values, client_phone: '0724111001', client_name: 'Client nou' },
    plannerBooking,
  );
  expect(changed.client_id).toBeUndefined();
  expect(changed.client_phone).toBe('+40724111001');
});

test.each(['2026-10-25T00:30:17Z', '2026-10-25T01:30:17Z'])(
  'păstrează momentul UTC și secundele la editarea observațiilor: %s',
  start => {
    const original = {
      ...plannerBooking,
      date: '2026-10-25',
      starts_at: start,
      ends_at: start.replace(':17Z', ':47Z'),
      staff: [
        {
          employee_id: 'employee-1',
          job_role: 'waiter',
          pay_type: 'hourly' as const,
          rate: '40.00',
          starts_at: start,
          ends_at: start.replace(':17Z', ':47Z'),
        },
      ],
    };
    const values = {
      ...bookingFormDefaults(original.date, original.hall_id, original),
      notes: 'Observații actualizate',
    };
    expect(bookingFormSchema.safeParse(values).success).toBe(true);
    const payload = bookingPayload(values, original);
    expect(payload.starts_at).toBe(original.starts_at);
    expect(payload.ends_at).toBe(original.ends_at);
    expect(payload.staff?.[0].starts_at).toBe(start);
    expect(payload.version).toBe(original.version);
  },
);

test('compară momentele UTC când intervalul traversează ora repetată', () => {
  const values = {
    ...bookingFormDefaults('2026-10-25', 'hall-1'),
    client_id: 'client-1',
    status: 'confirmed' as const,
    starts_at: '2026-10-25 03:50 +03:00',
    ends_at: '2026-10-25 03:10 +02:00',
    minimum_guests: '100',
    menu_price: '300',
  };
  expect(bookingFormSchema.safeParse(values).success).toBe(true);
  const payload = bookingPayload(values);
  expect(payload.starts_at).toBe('2026-10-25T00:50:00.000Z');
  expect(payload.ends_at).toBe('2026-10-25T01:10:00.000Z');
});

test('refuză ora ambiguă fără offset și ora inexistentă de primăvară', () => {
  const values = {
    ...bookingFormDefaults('2026-10-25', 'hall-1'),
    client_id: 'client-1',
    status: 'cancelled' as const,
    starts_at: '2026-10-25 03:30',
    ends_at: '',
  };
  expect(bookingFormSchema.safeParse(values).success).toBe(false);
  expect(
    bookingFormSchema.safeParse({
      ...values,
      date: '2026-03-29',
      starts_at: '2026-03-29 03:30',
    }).success,
  ).toBe(false);
});
