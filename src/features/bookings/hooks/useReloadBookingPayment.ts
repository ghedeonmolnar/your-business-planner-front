import { useMutation } from '@tanstack/react-query';
import { getBookingPaymentApi } from '@/features/bookings/api/bookingFinanceApi';

export const useReloadBookingPayment = () =>
  useMutation({ mutationFn: getBookingPaymentApi });
