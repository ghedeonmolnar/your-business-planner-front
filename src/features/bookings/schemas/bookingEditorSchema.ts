import {
  bookingCreationFormSchema,
  bookingFormSchema,
} from '@/features/bookings/schemas/bookingFormSchema';
import { Booking } from '@/features/bookings/types';
import { companyNow } from '@/shared/utils/formatDate';
import { toCents } from '@/shared/utils/money';

export const needsBookingAdvanceReceipt = (booking?: Booking) =>
  !booking ||
  (!['confirmed', 'completed'].includes(booking.status) &&
    toCents(booking.paid_amount ?? '0') === 0);

export const bookingEditorSchema = (booking?: Booking, financeEnabled = true) =>
  (booking ? bookingFormSchema : bookingCreationFormSchema).superRefine(
    (values, context) => {
      const today = companyNow().format('YYYY-MM-DD');
      if (
        values.status === 'tentative' &&
        values.advance_due_at &&
        values.advance_due_at !== booking?.advance_due_at &&
        values.advance_due_at < today
      ) {
        context.addIssue({
          code: 'custom',
          path: ['advance_due_at'],
          message: 'Alege ziua de azi sau o dată viitoare.',
        });
      }
      if (
        !financeEnabled ||
        !['confirmed', 'completed'].includes(values.status)
      )
        return;
      const received = toCents(
        values.advance_received_amount?.replace(',', '.') || '0',
      );
      if (received <= 0 && needsBookingAdvanceReceipt(booking)) {
        context.addIssue({
          code: 'custom',
          path: ['advance_received_amount'],
          message: 'Completează avansul primit pentru a confirma rezervarea.',
        });
      }
      if (received <= 0) return;
      if (!values.advance_received_method) {
        context.addIssue({
          code: 'custom',
          path: ['advance_received_method'],
          message: 'Alege metoda de încasare.',
        });
      }
      if (!values.advance_received_at || values.advance_received_at > today) {
        context.addIssue({
          code: 'custom',
          path: ['advance_received_at'],
          message: 'Alege ziua de azi sau data la care ai primit avansul.',
        });
      }
    },
  );
