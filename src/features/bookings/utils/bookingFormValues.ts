import { Booking, BookingPayload } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import {
  formatCompanyInput,
  toCompanyTimestamp,
} from '@/shared/utils/formatDate';

export const bookingFormDefaults = (
  date: string,
  hallId?: string,
  booking?: Booking,
  defaultMinimumGuests?: number | null,
): BookingFormValues => ({
  hall_id: booking?.hall_id ?? hallId ?? '',
  client_id: booking?.client_id ?? '',
  date: booking?.date ?? date,
  type: booking?.type ?? 'nunta',
  status:
    booking?.status === 'expired'
      ? 'tentative'
      : (booking?.status ?? 'tentative'),
  starts_at: formatCompanyInput(booking?.starts_at),
  ends_at: formatCompanyInput(booking?.ends_at),
  expires_at: '',
  minimum_guests: String(
    booking ? (booking.minimum_guests ?? 0) : (defaultMinimumGuests ?? 0),
  ),
  final_guests:
    booking?.final_guests == null ? '' : String(booking.final_guests),
  menu_price: booking?.menu_price ?? '0',
  menu_name: booking?.menu_name ?? '',
  agreed_advance: booking?.agreed_advance ?? '0',
  advance_due_at: booking?.advance_due_at ?? '',
  extra_services: booking?.extra_services ?? [],
  notes: booking?.notes ?? '',
  staff:
    booking?.staff.map(person => ({
      employee_id: person.employee_id,
      job_role: person.job_role,
      pay_type: person.pay_type,
      rate: person.rate,
      starts_at: formatCompanyInput(person.starts_at),
      ends_at: formatCompanyInput(person.ends_at),
    })) ?? [],
});

const retainedTimestamp = (value: string, original?: string | null) =>
  original && value === formatCompanyInput(original)
    ? original
    : toCompanyTimestamp(value);

export const bookingPayload = (
  values: BookingFormValues,
  original?: Booking,
): BookingPayload => ({
  ...values,
  version: original?.version,
  starts_at: retainedTimestamp(values.starts_at, original?.starts_at),
  ends_at: retainedTimestamp(values.ends_at, original?.ends_at),
  expires_at: null,
  minimum_guests: Number(values.minimum_guests),
  final_guests: values.final_guests ? Number(values.final_guests) : null,
  menu_price: values.menu_price.replace(',', '.'),
  menu_name: values.menu_name || null,
  agreed_advance: values.agreed_advance.replace(',', '.'),
  advance_due_at: values.advance_due_at || null,
  extra_services: values.extra_services.map(service => ({
    ...service,
    amount: service.amount.replace(',', '.'),
  })),
  staff: values.staff.map(person => ({
    ...person,
    rate: person.rate.replace(',', '.'),
    starts_at:
      retainedTimestamp(
        person.starts_at,
        original?.staff.find(item => item.employee_id === person.employee_id)
          ?.starts_at,
      ) ?? '',
    ends_at:
      retainedTimestamp(
        person.ends_at,
        original?.staff.find(item => item.employee_id === person.employee_id)
          ?.ends_at,
      ) ?? '',
  })),
});
