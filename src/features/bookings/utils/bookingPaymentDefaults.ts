import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { BookingPaymentValues } from '@/features/bookings/schemas/paymentSchema';
import { companyNow } from '@/shared/utils/formatDate';

export const bookingPaymentDefaults = (
  payment?: BookingPayment,
  recovered?: BookingPaymentValues,
): BookingPaymentValues => ({
  type: payment?.type ?? recovered?.type ?? 'incoming',
  category: payment?.category ?? recovered?.category ?? 'advance',
  amount: payment ? String(payment.amount) : (recovered?.amount ?? ''),
  paid_at:
    payment?.paid_at ?? recovered?.paid_at ?? companyNow().format('YYYY-MM-DD'),
  method: payment?.method ?? recovered?.method ?? 'transfer',
  status: payment?.status ?? recovered?.status ?? 'completed',
  notes: payment?.notes ?? recovered?.notes ?? '',
});
