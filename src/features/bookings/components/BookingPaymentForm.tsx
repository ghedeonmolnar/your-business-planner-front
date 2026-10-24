import { companyNow } from '@/shared/utils/formatDate';
import { Text } from 'react-native-paper';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bookingPaymentSchema,
  BookingPaymentValues,
} from '@/features/bookings/schemas/paymentSchema';
import { useSaveBookingPayment } from '@/features/bookings/hooks/useBookingFinance';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';
import { FormActions } from '@/shared/components/FormActions';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';
import { createPaymentOperationId } from '@/features/bookings/utils/paymentOperation';
import { ApiError } from '@/shared/api/apiError';

export function BookingPaymentForm({
  eventId,
  payment,
  onClose,
}: {
  eventId: string;
  payment?: BookingPayment;
  onClose: () => void;
}) {
  const mutation = useSaveBookingPayment(eventId);
  const paymentVersion = useRef(payment?.version);
  const submitting = useRef(false);
  const recovered = payment ? undefined : mutation.uncertainPayment?.payload;
  const operationId = useRef<string | null>(recovered?.operation_id ?? null);
  const submittedPayload = useRef<BookingPaymentValues | null>(
    recovered ?? null,
  );
  const form = useForm<BookingPaymentValues>({
    resolver: zodResolver(bookingPaymentSchema),
    defaultValues: {
      type: payment?.type ?? recovered?.type ?? 'incoming',
      category: payment?.category ?? recovered?.category ?? 'advance',
      amount: payment ? String(payment.amount) : (recovered?.amount ?? ''),
      paid_at:
        payment?.paid_at ??
        recovered?.paid_at ??
        companyNow().format('YYYY-MM-DD'),
      method: payment?.method ?? recovered?.method ?? 'transfer',
      status: payment?.status ?? recovered?.status ?? 'completed',
      notes: payment?.notes ?? recovered?.notes ?? '',
    },
  });
  const type = form.watch('type');
  const categories = bookingPaymentCategories[type];
  const submit = form.handleSubmit(values => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    operationId.current ??= createPaymentOperationId();
    const data = submittedPayload.current ?? recovered ?? values;
    if (!payment) submittedPayload.current = data;
    mutation.mutate(
      {
        eventId,
        id: payment?.id,
        payload: {
          ...data,
          amount: data.amount.replace(',', '.'),
          version: paymentVersion.current,
          operation_id: payment ? undefined : operationId.current,
        },
      },
      {
        onSuccess: onClose,
        onSettled: () => {
          submitting.current = false;
        },
        onError: error => {
          const refused =
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500;
          if (refused) submittedPayload.current = null;
          showError(error, 'Nu am putut salva plata.');
        },
      },
    );
  });
  return (
    <FormModalFrame
      visible
      busy={mutation.isPending}
      readOnly={
        !payment && (submittedPayload.current !== null || Boolean(recovered))
      }
      title={payment ? 'Editează plata' : 'Încasare sau cheltuială'}
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={mutation.isPending}
          primary={{ label: 'Salvează plata', onPress: submit }}
        />
      }
    >
      {!payment && submittedPayload.current !== null && !mutation.isPending ? (
        <Text>
          Rezultatul înregistrării nu este încă sigur. Reîncearcă salvarea: se
          va verifica aceeași operațiune, fără a crea o plată duplicată.
        </Text>
      ) : null}
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
