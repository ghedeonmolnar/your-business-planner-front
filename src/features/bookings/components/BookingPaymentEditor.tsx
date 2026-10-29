import { Text } from 'react-native-paper';
import React, { useRef, useState } from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  bookingPaymentSchema,
  BookingPaymentValues,
} from '@/features/bookings/schemas/paymentSchema';
import type { useSaveBookingPayment } from '@/features/bookings/hooks/useSaveBookingPayment';
import { BookingPayment } from '@/features/bookings/schemas/bookingFinanceSchemas';
import { bookingPaymentCategories } from '@/features/bookings/utils/bookingLabels';
import { FormActions } from '@/shared/components/FormActions';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';
import { createPaymentOperationId } from '@/features/bookings/utils/paymentOperation';
import { ApiError, apiErrorCode } from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';
import { useReloadBookingPayment } from '@/features/bookings/hooks/useReloadBookingPayment';
import { bookingPaymentDefaults } from '@/features/bookings/utils/bookingPaymentDefaults';

export function BookingPaymentEditor({
  eventId,
  payment,
  onClose,
  mutation,
}: {
  eventId: string;
  payment?: BookingPayment;
  onClose: () => void;
  mutation: ReturnType<typeof useSaveBookingPayment>;
}) {
  const [sessionGeneration] = useState(getSessionGeneration);
  const paymentVersion = useRef(payment?.version);
  const [conflict, setConflict] = useState(false);
  const reload = useReloadBookingPayment();
  const submitting = useRef(false);
  const recovered = payment ? undefined : mutation.uncertainPayment?.payload;
  const operationId = useRef<string | null>(recovered?.operation_id ?? null);
  const submittedPayload = useRef<BookingPaymentValues | null>(
    recovered ?? null,
  );
  const form = useAppForm<BookingPaymentValues>({
    resolver: zodResolver(bookingPaymentSchema),
    defaultValues: bookingPaymentDefaults(payment, recovered),
  });
  const type = form.watch('type');
  const categories = bookingPaymentCategories[type];
  const save = (values: BookingPaymentValues) => {
    if (
      conflict ||
      submitting.current ||
      sessionGeneration !== getSessionGeneration()
    ) {
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
        onSuccess: () => {
          if (sessionGeneration === getSessionGeneration()) onClose();
        },
        onSettled: () => {
          submitting.current = false;
        },
        onError: error => {
          if (sessionGeneration !== getSessionGeneration()) return;
          if (apiErrorCode(error) === 'RESOURCE_VERSION_CONFLICT')
            setConflict(true);
          const refused =
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500;
          if (refused && error.status !== 409) submittedPayload.current = null;
          showError(error, 'Nu am putut salva plata.');
        },
      },
    );
  };
  const submit = () => {
    const saved = submittedPayload.current ?? recovered;
    if (saved) return save(saved);
    return form.handleSubmit(save)();
  };
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
          primary={{
            label: 'Salvează plata',
            onPress: submit,
            disabled: conflict || reload.isPending,
          }}
        />
      }
    >
      {conflict && payment ? (
        <VersionConflictNotice
          onReload={async () => {
            const current = await reload.mutateAsync(payment.id);
            assertCurrentRequestSession(sessionGeneration);
            paymentVersion.current = current.version;
            form.reset(bookingPaymentDefaults(current));
            setConflict(false);
          }}
        />
      ) : null}
      {!payment &&
      (submittedPayload.current !== null || recovered) &&
      !mutation.isPending ? (
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
        required
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
        required
        label="Categorie"
        single
        options={categories}
        placeholder="Alege categoria"
        searchPlaceholder="Caută categorie"
      />
      <ControlledTextField
        control={form.control}
        name="amount"
        required
        label="Sumă (lei)"
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <ControlledDateField
        control={form.control}
        name="paid_at"
        required
        label="Data operațiunii"
        placeholder="Alege data"
      />
      <ControlledSelectField
        control={form.control}
        name="method"
        required
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
        required
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
