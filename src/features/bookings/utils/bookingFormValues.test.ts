import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { bookingFormSchema } from '@/features/bookings/schemas/bookingFormSchema';

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
