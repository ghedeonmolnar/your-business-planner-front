import {
  getBookingCreationAttempt,
  rememberBookingCreationAttempt,
} from '@/features/bookings/utils/bookingCreationRecovery';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import { advanceSessionGeneration } from '@/shared/api/sessionExpiry';

test('izolează încercările de creare și le șterge la schimbarea sesiunii', () => {
  const values = bookingFormDefaults('2027-11-13', 'hall-1');
  const attempt = {
    values,
    payload: { ...bookingPayload(values), operation_id: 'operation-1' },
  };
  rememberBookingCreationAttempt('company-1/owner-1', attempt);
  expect(getBookingCreationAttempt('company-1/owner-1')).toBe(attempt);
  expect(getBookingCreationAttempt('company-2/owner-1')).toBeUndefined();
  advanceSessionGeneration();
  expect(getBookingCreationAttempt('company-1/owner-1')).toBeUndefined();
});
