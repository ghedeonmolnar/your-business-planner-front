import { bookingEditorSchema } from '@/features/bookings/schemas/bookingEditorSchema';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { companyNow } from '@/shared/utils/formatDate';

const values = () => ({
  ...bookingFormDefaults(
    plannerBooking.date,
    plannerBooking.hall_id,
    plannerBooking,
  ),
  client_phone: '0724111001',
});

test('scadența nouă acceptă azi și viitorul, iar editarea păstrează termenul istoric', () => {
  const form = { ...values(), status: 'tentative' as const };
  const yesterday = companyNow().subtract(1, 'day').format('YYYY-MM-DD');
  expect(
    bookingEditorSchema().safeParse({ ...form, advance_due_at: yesterday })
      .success,
  ).toBe(false);
  for (const advance_due_at of [
    '',
    companyNow().format('YYYY-MM-DD'),
    companyNow().add(1, 'day').format('YYYY-MM-DD'),
  ]) {
    expect(
      bookingEditorSchema().safeParse({ ...form, advance_due_at }).success,
    ).toBe(true);
  }
  expect(
    bookingEditorSchema({
      ...plannerBooking,
      advance_due_at: yesterday,
    }).safeParse({ ...form, advance_due_at: yesterday }).success,
  ).toBe(true);
});

test.each(['confirmed', 'completed'] as const)(
  'starea %s cere suma și metoda, cu data de azi precompletată',
  status => {
    const form = { ...values(), status };
    const schema = bookingEditorSchema();
    expect(form.advance_received_at).toBe(companyNow().format('YYYY-MM-DD'));
    expect(schema.safeParse(form).success).toBe(false);
    expect(
      schema.safeParse({ ...form, advance_received_amount: '500,25' }).success,
    ).toBe(false);
    const receipt = {
      ...form,
      advance_received_amount: '500,25',
      advance_received_method: 'transfer' as const,
    };
    expect(schema.safeParse(receipt).success).toBe(true);
    expect(
      schema.safeParse({
        ...receipt,
        advance_received_at: companyNow().add(1, 'day').format('YYYY-MM-DD'),
      }).success,
    ).toBe(false);
    const operationId = '10000000-0000-4000-8000-000000000001';
    expect(bookingPayload(receipt, undefined, operationId)).toMatchObject({
      agreed_advance: '500.25',
      advance_receipt: {
        operation_id: operationId,
        amount: '500.25',
        method: 'transfer',
        paid_at: form.advance_received_at,
      },
    });
    expect(bookingPayload(receipt, undefined, operationId)).not.toHaveProperty(
      'advance_received_amount',
    );
    expect(
      bookingPayload(
        { ...receipt, status: 'tentative' },
        undefined,
        operationId,
      ).advance_receipt,
    ).toBeUndefined();
  },
);

test('editarea nu precompletează sau dublează încasările existente', () => {
  const form = values();
  expect(form.advance_received_amount).toBe('');
  expect(bookingEditorSchema(plannerBooking).safeParse(form).success).toBe(
    true,
  );
  expect(
    bookingPayload(form, plannerBooking, 'receipt-id').advance_receipt,
  ).toBeUndefined();
  expect(
    bookingEditorSchema({
      ...plannerBooking,
      status: 'tentative',
      paid_amount: '0',
    }).safeParse(form).success,
  ).toBe(false);
  expect(bookingEditorSchema(undefined, false).safeParse(form).success).toBe(
    true,
  );
});
