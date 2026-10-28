import {
  bookingCreationFormSchema,
  bookingFormSchema,
} from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';

const overnight = () => ({
  ...bookingFormDefaults('2027-11-13', 'hall-1'),
  client_id: 'client-1',
  status: 'confirmed' as const,
  starts_at: '2027-11-13 18:00',
  ends_at: '2027-11-14 04:00',
  minimum_guests: '200',
  menu_price: '350',
});
const person = {
  employee_id: 'employee-1',
  job_role: 'waiter',
  pay_type: 'hourly' as const,
  rate: '40',
  starts_at: '2027-11-13 16:00',
  ends_at: '2027-11-14 05:00',
};

test('accepts a confirmed reservation and staff interval across midnight', () => {
  expect(
    bookingFormSchema.safeParse({ ...overnight(), staff: [person] }).success,
  ).toBe(true);
});

test('rejects a start date that differs from the event date', () => {
  const result = bookingFormSchema.safeParse({
    ...overnight(),
    date: '2027-11-14',
  });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(
      result.error.issues.some(issue => issue.path.join('.') === 'starts_at'),
    ).toBe(true);
  }
});

test('rejects duplicate or inverted staff intervals for a waiting request', () => {
  const result = bookingFormSchema.safeParse({
    ...overnight(),
    status: 'tentative',
    expires_at: '2020-01-01 10:00',
    staff: [person, { ...person, ends_at: '2027-11-13 15:00' }],
  });
  expect(result.success).toBe(false);
  if (!result.success) {
    const fields = result.error.issues.map(issue => issue.path.join('.'));
    expect(fields).toEqual(
      expect.arrayContaining(['staff.1.employee_id', 'staff.1.ends_at']),
    );
  }
});

test('acceptă o cerere fără avans, fără termen și fără program', () => {
  expect(
    bookingFormSchema.safeParse({
      ...bookingFormDefaults('2027-11-13', 'hall-1'),
      client_id: 'client-1',
    }).success,
  ).toBe(true);
});

test('rezervările noi refuză trecutul după ziua României, iar istoricul rămâne editabil', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-28T22:15:00Z'));
  try {
    const past = {
      ...bookingFormDefaults('2026-10-28', 'hall-1'),
      client_id: 'client-1',
    };
    expect(bookingCreationFormSchema.safeParse(past).success).toBe(false);
    expect(
      bookingCreationFormSchema.safeParse({ ...past, date: '2026-10-29' })
        .success,
    ).toBe(true);
    expect(bookingFormSchema.safeParse(past).success).toBe(true);
  } finally {
    jest.useRealTimers();
  }
});
