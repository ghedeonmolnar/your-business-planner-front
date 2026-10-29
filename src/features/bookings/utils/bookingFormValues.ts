import { Booking, BookingPayload } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { normalizePhone } from '@/shared/utils/contactLinks';
import {
  formatCompanyInput,
  toCompanyTimestamp,
} from '@/shared/utils/formatDate';

export type BookingHallDefaults = {
  minimum_guests?: number | null;
  menu_price?: string | null;
  child_menu_price?: string | null;
};

export const bookingFormDefaults = (
  date: string,
  hallId?: string,
  booking?: Booking,
  hall?: BookingHallDefaults,
): BookingFormValues => ({
  hall_id: booking?.hall_id ?? hallId ?? '',
  client_id: booking?.client_id ?? '',
  client_phone: normalizePhone(booking?.client_phone ?? '')
    ? (booking?.client_phone ?? '')
    : '',
  client_name: '',
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
    booking ? (booking.minimum_guests ?? 0) : (hall?.minimum_guests ?? 0),
  ),
  estimated_guests: String(
    booking
      ? (booking.estimated_guests ?? booking.minimum_guests ?? 0)
      : (hall?.minimum_guests ?? 0),
  ),
  child_guests:
    booking?.child_guests == null ? '' : String(booking.child_guests),
  child_menu_price: booking
    ? (booking.child_menu_price ?? '0')
    : (hall?.child_menu_price ?? '0'),
  final_guests:
    booking?.final_guests == null ? '' : String(booking.final_guests),
  menu_price: booking ? (booking.menu_price ?? '0') : (hall?.menu_price ?? '0'),
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

const clientPayload = (
  values: BookingFormValues,
  original?: Booking,
): Pick<BookingPayload, 'client_id' | 'client_phone' | 'client_name'> => {
  const phone = normalizePhone(values.client_phone ?? '');
  if (
    phone &&
    (!original || phone !== normalizePhone(original.client_phone ?? ''))
  ) {
    return {
      client_id: undefined,
      client_phone: phone,
      client_name: values.client_name?.trim() || undefined,
    };
  }
  return {
    client_id: values.client_id || original?.client_id,
    client_phone: undefined,
    client_name: undefined,
  };
};

export const bookingPayload = (
  values: BookingFormValues,
  original?: Booking,
): BookingPayload => ({
  ...values,
  ...clientPayload(values, original),
  version: original?.version,
  starts_at: retainedTimestamp(values.starts_at, original?.starts_at),
  ends_at: retainedTimestamp(values.ends_at, original?.ends_at),
  expires_at: null,
  minimum_guests: Number(values.minimum_guests),
  estimated_guests:
    values.estimated_guests === undefined
      ? undefined
      : values.estimated_guests
        ? Number(values.estimated_guests)
        : null,
  child_guests:
    values.child_guests === undefined
      ? undefined
      : values.child_guests
        ? Number(values.child_guests)
        : null,
  child_menu_price:
    values.child_menu_price === undefined
      ? undefined
      : values.child_menu_price.replace(',', '.') || '0',
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
