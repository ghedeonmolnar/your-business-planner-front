import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { normalizePhone } from '@/shared/utils/contactLinks';

export const validateBookingClientPhone = (
  form: UseFormReturn<BookingFormValues>,
  booking?: Booking,
) => {
  const phone = form.getValues('client_phone') ?? '';
  if (
    normalizePhone(phone) ||
    (booking &&
      booking.client_id === form.getValues('client_id') &&
      !form.getFieldState('client_phone').isDirty)
  )
    return true;
  form.setError('client_phone', {
    type: 'validate',
    message: phone.trim()
      ? 'Introdu un număr de telefon valid.'
      : 'Completează numărul de telefon al clientului.',
  });
  return false;
};
