import dayjs from 'dayjs';
import { EventPayment } from '@/features/events/types';
import {
  emptyPaymentForm,
  PaymentFormInput,
} from '@/features/events/schemas/paymentSchema';
import { SelectOption } from '@/shared/components/ControlledSelectField';
import { sumMoney } from '@/shared/utils/money';

export const typeOptions = [
  { id: 'incoming', name: 'Încasare' },
  { id: 'outgoing', name: 'Plată' },
] as const;

export const methodOptions: SelectOption<string>[] = [
  { id: 'cash', name: 'Cash' },
  { id: 'card', name: 'Card' },
  { id: 'transfer', name: 'Transfer' },
];

export const statusOptions = [
  { id: 'completed', name: 'Finalizată' },
  { id: 'pending', name: 'În așteptare' },
  { id: 'cancelled', name: 'Anulată' },
] as const;

export const paymentFormValues = (
  payment?: EventPayment | null,
): PaymentFormInput => {
  if (!payment) {
    return {
      ...emptyPaymentForm,
      paid_at: dayjs().format('YYYY-MM-DD'),
    };
  }

  const method = payment.method?.trim().toLowerCase() ?? '';

  return {
    type: payment.type,
    category: payment.category,
    amount: Math.max(
      sumMoney([payment.amount, -(payment.overtime?.amount ?? 0)]),
      0,
    ),
    paid_at: payment.paid_at,
    method: methodOptions.some(option => option.id === method) ? method : '',
    status: payment.status,
    notes: payment.notes ?? '',
  };
};
