import React, { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  emptyPaymentForm,
  PaymentFormInput,
  PaymentFormValues,
  paymentSchema,
} from '@/features/events/schemas/paymentSchema';
import {
  Event,
  EventPayment,
  EventPaymentPayload,
} from '@/features/events/types';
import { PaymentOvertimeForm } from '@/features/events/components/PaymentOvertimeForm';
import { paymentFormValues } from '@/features/events/components/paymentFormConfig';
import { PaymentDetailsFields } from '@/features/events/components/PaymentDetailsFields';
import { paymentEmployeeOptions } from '@/features/events/utils/paymentOvertime';
import { usePaymentOvertimeForm } from '@/features/events/hooks/usePaymentOvertimeForm';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';

type PaymentFormProps = {
  visible: boolean;
  defaultAmount?: number;
  eventRating?: number | null;
  event?: Event | null;
  initialPayment?: EventPayment | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: EventPaymentPayload) => void | Promise<void>;
};

export function PaymentForm({
  visible,
  defaultAmount,
  eventRating,
  event,
  initialPayment,
  saving,
  onCancel,
  onSubmit,
}: PaymentFormProps) {
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useAppForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: emptyPaymentForm,
  });
  const selectedType = useWatch({ control, name: 'type' });
  const [settlementType, setSettlementType] = React.useState<
    'partial' | 'full'
  >('full');
  const [rating, setRating] = React.useState<number | null>(null);
  const [showOvertime, setShowOvertime] = React.useState(false);
  const [pendingPayment, setPendingPayment] =
    React.useState<EventPaymentPayload | null>(null);
  const employees = paymentEmployeeOptions(event);
  const overtimeForm = usePaymentOvertimeForm({
    visible,
    amount: pendingPayment?.amount ?? 0,
    employees,
    initialOvertime: initialPayment?.overtime,
    saving,
    onSubmit: (overtime, total) =>
      pendingPayment
        ? onSubmit({ ...pendingPayment, amount: total, overtime })
        : undefined,
  });
  const initialSettlementType =
    !initialPayment ||
    (initialPayment.type === 'incoming' && initialPayment.category === 'full')
      ? 'full'
      : 'partial';
  const hasUnsavedChanges =
    isDirty ||
    pendingPayment !== null ||
    settlementType !== initialSettlementType ||
    rating !== (eventRating ?? null);

  useEffect(() => {
    if (visible) {
      const values = paymentFormValues(initialPayment);

      reset({
        ...values,
        amount:
          initialPayment || !defaultAmount
            ? values.amount
            : Math.max(defaultAmount, 0),
      });
      setSettlementType(
        !initialPayment ||
          (values.type === 'incoming' && values.category === 'full')
          ? 'full'
          : 'partial',
      );
      setRating(eventRating ?? null);
      setPendingPayment(null);
      setShowOvertime(false);
    }
  }, [defaultAmount, eventRating, initialPayment, reset, visible]);

  const submit = (values: PaymentFormValues) => {
    if (saving) {
      return;
    }

    const isFullIncoming =
      values.type === 'incoming' && settlementType === 'full';

    const payload: EventPaymentPayload = {
      ...values,
      category: values.type === 'incoming' ? settlementType : values.category,
      method: values.method?.trim() || null,
      notes: values.notes?.trim() || null,
      ...(isFullIncoming ? { rating } : {}),
    };

    if (isFullIncoming) {
      setPendingPayment(payload);
      setShowOvertime(true);
      return;
    }

    return onSubmit(payload);
  };

  return (
    <FormModalFrame
      footer={
        <>
          {showOvertime ? (
            <AppButton
              disabled={saving}
              fullWidth
              label="Înapoi"
              onPress={() => setShowOvertime(false)}
              variant="ghost"
            />
          ) : null}
          <AppButton
            disabled={saving}
            fullWidth
            label={
              saving
                ? 'Se salvează...'
                : showOvertime
                  ? 'Salvează plata'
                  : 'Salvează'
            }
            onPress={showOvertime ? overtimeForm.submit : handleSubmit(submit)}
            loading={saving}
            size="large"
          />
        </>
      }
      hasUnsavedChanges={hasUnsavedChanges}
      onClose={onCancel}
      title={
        showOvertime
          ? 'A fost prelungire?'
          : initialPayment
            ? 'Editează plata'
            : 'Plată nouă'
      }
      visible={visible}
      progress={
        selectedType === 'incoming' && settlementType === 'full'
          ? { current: showOvertime ? 2 : 1, total: 2 }
          : undefined
      }
      busy={saving}
    >
      {showOvertime ? (
        <PaymentOvertimeForm employees={employees} form={overtimeForm} />
      ) : (
        <PaymentDetailsFields
          control={control}
          onRatingChange={setRating}
          onSettlementTypeChange={setSettlementType}
          rating={rating}
          selectedType={selectedType}
          settlementType={settlementType}
        />
      )}
    </FormModalFrame>
  );
}
