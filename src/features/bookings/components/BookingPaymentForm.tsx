import { companyNow } from '@/shared/utils/formatDate';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bookingPaymentSchema,
  BookingPaymentValues,
} from '@/features/bookings/schemas/paymentSchema';
import { useSaveBookingPayment } from '@/features/bookings/hooks/useBookingFinance';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';

export function BookingPaymentForm({
  eventId,
  payment,
  onClose,
}: {
  eventId: string;
  payment?: BookingPayment;
  onClose: () => void;
}) {
  const mutation = useSaveBookingPayment();
  const form = useForm<BookingPaymentValues>({
    resolver: zodResolver(bookingPaymentSchema),
    defaultValues: {
      type: payment?.type ?? 'incoming',
      category: payment?.category ?? 'advance',
      amount: payment ? String(payment.amount) : '',
      paid_at: payment?.paid_at ?? companyNow().format('YYYY-MM-DD'),
      method: payment?.method ?? 'transfer',
      status: payment?.status ?? 'completed',
      notes: payment?.notes ?? '',
    },
  });
  const type = form.watch('type');
  const categories = bookingPaymentCategories[type];
  const submit = form.handleSubmit(values => {
    mutation.mutate(
      {
        eventId,
        id: payment?.id,
        payload: { ...values, amount: values.amount.replace(',', '.') },
      },
      {
        onSuccess: onClose,
        onError: error => showError(error, 'Nu am putut salva plata.'),
      },
    );
  });
  return (
    <FormModalFrame
      visible
      title={payment ? 'Editează plata' : 'Încasare sau cheltuială'}
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <AppButton
          label="Salvează plata"
          disabled={mutation.isPending}
          onPress={submit}
        />
      }
    >
      <ControlledSelectField
        control={form.control}
        name="type"
        onSelectionChange={selected => {
          const nextType = selected[0];
          if (nextType === 'incoming' || nextType === 'outgoing') {
            const currentCategory = form.getValues('category');
            if (
              !bookingPaymentCategories[nextType].some(
                option => option.id === currentCategory,
              )
            ) {
              form.setValue(
                'category',
                bookingPaymentCategories[nextType][0].id,
                { shouldDirty: true },
              );
            }
          }
        }}
        label="Operațiune"
        single
        options={[
          { id: 'incoming', name: 'Încasare' },
          { id: 'outgoing', name: 'Cheltuială' },
        ]}
        placeholder="Alege operațiunea"
        searchPlaceholder="Caută"
      />
      <ControlledSelectField
        control={form.control}
        name="category"
        label="Categorie"
        single
        options={categories}
        placeholder="Alege categoria"
        searchPlaceholder="Caută categorie"
      />
      <ControlledTextField
        control={form.control}
        name="amount"
        label="Sumă (lei)"
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <ControlledDateField
        control={form.control}
        name="paid_at"
        label="Data operațiunii"
        placeholder="Alege data"
      />
      <ControlledSelectField
        control={form.control}
        name="method"
        label="Metodă"
        single
        options={[
          { id: 'cash', name: 'Numerar' },
          { id: 'card', name: 'Card' },
          { id: 'transfer', name: 'Transfer' },
        ]}
        placeholder="Alege metoda"
        searchPlaceholder="Caută metodă"
      />
      <ControlledSelectField
        control={form.control}
        name="status"
        label="Stare"
        single
        options={[
          { id: 'completed', name: 'Efectuată' },
          { id: 'pending', name: 'În așteptare' },
          { id: 'cancelled', name: 'Anulată' },
        ]}
        placeholder="Alege starea"
        searchPlaceholder="Caută stare"
      />
      <ControlledTextField
        control={form.control}
        name="notes"
        label="Observații"
        placeholder="Detalii"
        multiline
      />
    </FormModalFrame>
  );
}
