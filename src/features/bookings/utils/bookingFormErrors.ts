import { FieldErrors, FieldPath, UseFormReturn } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { ApiError, responseErrorCode } from '@/shared/api/apiError';
import { bookingAvailabilityField } from '@/features/bookings/utils/bookingCreationFailure';

const stepFields: FieldPath<BookingFormValues>[][] = [
  ['hall_id', 'date', 'type', 'status', 'starts_at', 'ends_at', 'expires_at'],
  ['client_id'],
  [
    'minimum_guests',
    'final_guests',
    'menu_price',
    'menu_name',
    'agreed_advance',
    'advance_due_at',
    'extra_services',
  ],
  ['staff'],
  ['notes'],
];

export const bookingStepFields = (staffEnabled: boolean) =>
  stepFields.filter(fields => staffEnabled || !fields.includes('staff'));

export const firstBookingErrorStep = (
  errors: FieldErrors<BookingFormValues>,
  staffEnabled: boolean,
) => {
  const index = bookingStepFields(staffEnabled).findIndex(fields =>
    fields.some(field => field in errors),
  );
  return Math.max(0, index);
};

const knownBookingField = (
  field: string,
): field is FieldPath<BookingFormValues> =>
  stepFields.flat().includes(field as FieldPath<BookingFormValues>) ||
  /^extra_services\.\d+\.(name|amount)$/.test(field) ||
  /^staff\.\d+\.(employee_id|job_role|pay_type|rate|starts_at|ends_at)$/.test(
    field,
  );

export const applyBookingApiErrors = (
  error: unknown,
  form: UseFormReturn<BookingFormValues>,
  staffEnabled: boolean,
) => {
  const availabilityField = bookingAvailabilityField(error);
  if (availabilityField) {
    form.setError(availabilityField, {
      type: 'server',
      message:
        availabilityField === 'hall_id'
          ? 'Sala a fost rezervată între timp. Alege altă sală sau alt interval.'
          : 'O persoană a fost alocată între timp. Verifică personalul și intervalele.',
    });
    return availabilityField === 'staff' && staffEnabled ? 3 : 0;
  }
  if (
    !(error instanceof ApiError) ||
    error.status !== 422 ||
    typeof error.details !== 'object' ||
    error.details === null ||
    !('response' in error.details)
  ) {
    return null;
  }
  const response = error.details.response;
  if (
    responseErrorCode({ kind: 'json', value: response }) ===
    'BOOKING_CLIENT_PHONE_REQUIRED'
  ) {
    form.setError('client_id', {
      type: 'server',
      message: 'Completează telefonul clientului înainte de rezervare.',
    });
    return 1;
  }
  if (
    typeof response !== 'object' ||
    response === null ||
    !('errors' in response)
  ) {
    return null;
  }
  const errors = response.errors;
  if (typeof errors !== 'object' || errors === null || Array.isArray(errors)) {
    return null;
  }
  const fields = Object.keys(errors).filter(knownBookingField);
  fields.forEach(field =>
    form.setError(field, {
      type: 'server',
      message: 'Verifică valoarea: nu mai este validă sau disponibilă.',
    }),
  );
  const index = bookingStepFields(staffEnabled).findIndex(step =>
    step.some(root =>
      fields.some(field => field === root || field.startsWith(root + '.')),
    ),
  );
  return index >= 0 ? index : null;
};
