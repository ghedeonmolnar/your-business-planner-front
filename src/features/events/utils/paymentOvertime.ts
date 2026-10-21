import { Event, EventPaymentOvertime } from '@/features/events/types';
import { MINUTES_PER_HOUR } from '@/features/events/schemas/paymentOvertimeSchema';
import { SelectOption } from '@/shared/components/ControlledSelectField';
import { toCents } from '@/shared/utils/money';

const CENTS_PER_LEU = 100;

export const overtimeAmount = (overtime: EventPaymentOvertime | null) => {
  if (!overtime) {
    return 0;
  }

  const perEmployeeCents = Math.round(
    (toCents(overtime.hourly_rate) * overtime.duration_minutes) /
      MINUTES_PER_HOUR,
  );

  return (perEmployeeCents * overtime.employee_ids.length) / CENTS_PER_LEU;
};

export const paymentEmployeeOptions = (
  event?: Event | null,
): SelectOption<string>[] => {
  const ids = event?.employee_ids?.length
    ? event.employee_ids
    : event?.employee_id
      ? [event.employee_id]
      : [];

  return ids.map((id, index) => ({
    id,
    name:
      event?.employees?.find(employee => employee.id === id)?.name ??
      event?.assignments?.find(assignment => assignment.employee_id === id)
        ?.employee_name ??
      `Animator ${index + 1}`,
  }));
};
