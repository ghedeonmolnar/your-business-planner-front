import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventPayment, EventPaymentOvertime } from '@/features/events/types';
import {
  MINUTES_PER_HOUR,
  OVERTIME_HOURS_DECIMAL_PLACES,
  normalizeOvertimeDecimal,
  PaymentOvertimeValues,
  paymentOvertimeSchema,
} from '@/features/events/schemas/paymentOvertimeSchema';
import { overtimeAmount } from '@/features/events/utils/paymentOvertime';
import { SelectOption } from '@/shared/components/ControlledSelectField';
import { MAX_TOTAL_AMOUNT } from '@/shared/schemas/moneyFieldSchema';
import { sumMoney } from '@/shared/utils/money';

type PaymentOvertimeFormOptions = {
  visible: boolean;
  amount: number;
  employees: SelectOption<string>[];
  initialOvertime?: EventPayment['overtime'];
  saving: boolean;
  onSubmit: (
    overtime: EventPaymentOvertime | null,
    total: number,
  ) => void | Promise<void>;
};

export function usePaymentOvertimeForm({
  visible,
  amount,
  employees,
  initialOvertime,
  saving,
  onSubmit,
}: PaymentOvertimeFormOptions) {
  const submissionPending = useRef(false);
  const { control, handleSubmit, reset, setError } =
    useForm<PaymentOvertimeValues>({
      resolver: zodResolver(paymentOvertimeSchema),
      defaultValues: {
        has_overtime: 'no',
        hours: '',
        hourly_rate: '',
        scope: 'all',
        employee_ids: [],
      },
    });
  const employeeIdsKey = employees.map(employee => employee.id).join(',');

  useEffect(() => {
    const ids = employeeIdsKey ? employeeIdsKey.split(',') : [];
    reset({
      has_overtime: initialOvertime ? 'yes' : 'no',
      hours: initialOvertime
        ? Number(
            (initialOvertime.duration_minutes / MINUTES_PER_HOUR).toFixed(
              OVERTIME_HOURS_DECIMAL_PLACES,
            ),
          )
        : '',
      hourly_rate: initialOvertime?.hourly_rate ?? '',
      scope:
        initialOvertime &&
        (initialOvertime.employee_ids.length !== ids.length ||
          ids.some(id => !initialOvertime.employee_ids.includes(id)))
          ? 'selected'
          : 'all',
      employee_ids: initialOvertime?.employee_ids ?? [],
    });
    submissionPending.current = false;
  }, [employeeIdsKey, initialOvertime, reset, visible]);

  const values = useWatch({ control });
  const employeeIds =
    values.scope === 'all'
      ? employees.map(employee => employee.id)
      : (values.employee_ids ?? []);
  const preview: EventPaymentOvertime | null =
    values.has_overtime === 'yes'
      ? {
          duration_minutes: Math.round(
            Number(normalizeOvertimeDecimal(values.hours ?? '')) *
              MINUTES_PER_HOUR,
          ),
          hourly_rate: Number(
            normalizeOvertimeDecimal(values.hourly_rate ?? ''),
          ),
          employee_ids: employeeIds,
        }
      : null;
  const extraAmount = overtimeAmount(preview);
  const total = sumMoney([amount, extraAmount]);

  const submit = handleSubmit(async formValues => {
    if (saving || submissionPending.current) {
      return;
    }

    if (
      formValues.has_overtime === 'yes' &&
      (employeeIds.length === 0 ||
        employeeIds.some(id => !employees.some(employee => employee.id === id)))
    ) {
      setError(formValues.scope === 'all' ? 'scope' : 'employee_ids', {
        message: 'Alege animatorii participanți la prelungire.',
      });
      return;
    }

    if (total > MAX_TOTAL_AMOUNT) {
      setError('hourly_rate', { message: 'Totalul plății este prea mare.' });
      return;
    }

    submissionPending.current = true;
    try {
      await onSubmit(preview, total);
    } finally {
      submissionPending.current = false;
    }
  });

  return { control, values, employeeIds, extraAmount, total, submit };
}
