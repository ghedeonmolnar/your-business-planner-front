import { BookingPayload } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { subscribeSessionChanges } from '@/shared/api/sessionExpiry';

export type BookingCreationAttempt = {
  values: BookingFormValues;
  payload: BookingPayload;
};
const attempts = new Map<string, BookingCreationAttempt>();
export const getBookingCreationAttempt = (owner: string) => attempts.get(owner);
export const rememberBookingCreationAttempt = (
  owner: string,
  attempt: BookingCreationAttempt,
) => attempts.set(owner, attempt);
export const forgetBookingCreationAttempt = (owner: string) =>
  attempts.delete(owner);
subscribeSessionChanges(() => attempts.clear());
