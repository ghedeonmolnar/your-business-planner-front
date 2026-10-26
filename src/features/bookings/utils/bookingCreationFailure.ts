import { ApiError, apiErrorCode } from '@/shared/api/apiError';

export const bookingAvailabilityField = (error: unknown) => {
  const code = apiErrorCode(error);
  if (code === 'HALL_ALREADY_BOOKED') return 'hall_id';
  if (code === 'EMPLOYEE_ALREADY_ASSIGNED') return 'staff';
  return null;
};

export const isDefinitiveBookingCreationFailure = (error: unknown) =>
  error instanceof ApiError &&
  error.status >= 400 &&
  error.status < 500 &&
  (error.status !== 409 || bookingAvailabilityField(error) !== null);
