import { z } from 'zod';
import { toCompanyTimestamp } from '@/shared/utils/formatDate';
import {
  MAX_BOOKING_GUESTS,
  MAX_BOOKING_AMOUNT,
  MAX_BOOKING_LABEL_LENGTH,
  MAX_BOOKING_NOTES_LENGTH,
  MAX_EXTRA_SERVICES,
  MAX_STAFF_ASSIGNMENTS,
} from '@/features/bookings/utils/bookingFormLimits';

const amount = z
  .string()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Introdu o sumă validă.')
  .refine(
    value => Number(value.replace(',', '.')) <= MAX_BOOKING_AMOUNT,
    'Suma depășește limita permisă.',
  );
const count = z
  .string()
  .regex(/^\d+$/, 'Introdu un număr întreg.')
  .refine(
    value => Number(value) <= MAX_BOOKING_GUESTS,
    'Sunt permiși cel mult 100.000 de invitați.',
  );
const label = z
  .string()
  .max(MAX_BOOKING_LABEL_LENGTH, 'Folosește cel mult 255 de caractere.');
const localTimestamp = z
  .string()
  .refine(
    value => !value || toCompanyTimestamp(value) !== null,
    'Introdu o dată și o oră valide. La ora repetată adaugă +03:00 sau +02:00.',
  );
export const bookingFormSchema = z
  .object({
    hall_id: z.string().min(1, 'Alege sala.'),
    client_id: z.string().min(1, 'Alege clientul.'),
    date: z.iso.date('Alege o dată validă.'),
    type: z.string().min(1, 'Alege tipul evenimentului.'),
    status: z.enum(['tentative', 'confirmed', 'completed', 'cancelled']),
    starts_at: localTimestamp,
    ends_at: localTimestamp,
    expires_at: localTimestamp,
    minimum_guests: count,
    final_guests: z
      .string()
      .refine(
        value => !value || /^\d+$/.test(value),
        'Introdu un număr întreg.',
      )
      .refine(
        value => !value || Number(value) <= MAX_BOOKING_GUESTS,
        'Sunt permiși cel mult 100.000 de invitați.',
      ),
    menu_price: amount,
    menu_name: label,
    agreed_advance: amount,
    advance_due_at: z
      .string()
      .refine(
        value => !value || z.iso.date().safeParse(value).success,
        'Alege o dată validă.',
      ),
    extra_services: z
      .array(z.object({ name: label.min(1, 'Completează serviciul.'), amount }))
      .max(MAX_EXTRA_SERVICES, 'Sunt permise cel mult 100 de servicii.'),
    staff: z
      .array(
        z.object({
          employee_id: z.string().min(1, 'Alege persoana.'),
          job_role: z.string(),
          pay_type: z.enum(['fixed', 'hourly']),
          rate: amount,
          starts_at: localTimestamp.refine(Boolean, 'Completează începutul.'),
          ends_at: localTimestamp.refine(Boolean, 'Completează sfârșitul.'),
        }),
      )
      .max(MAX_STAFF_ASSIGNMENTS, 'Sunt permise cel mult 200 de persoane.'),
    notes: z
      .string()
      .max(MAX_BOOKING_NOTES_LENGTH, 'Folosește cel mult 20.000 de caractere.'),
  })
  .superRefine((value, context) => {
    if (value.starts_at && value.starts_at.slice(0, 10) !== value.date) {
      context.addIssue({
        code: 'custom',
        path: ['starts_at'],
        message: 'Începutul trebuie să fie în data evenimentului.',
      });
    }
    const expiry = toCompanyTimestamp(value.expires_at);
    if (
      value.status === 'tentative' &&
      expiry &&
      Date.parse(expiry) <= Date.now()
    ) {
      context.addIssue({
        code: 'custom',
        path: ['expires_at'],
        message: 'Alege un termen în viitor.',
      });
    }
    const employeeIds = new Set<string>();
    value.staff.forEach((person, index) => {
      if (person.employee_id && employeeIds.has(person.employee_id)) {
        context.addIssue({
          code: 'custom',
          path: ['staff', index, 'employee_id'],
          message: 'Persoana este deja alocată rezervării.',
        });
      }
      employeeIds.add(person.employee_id);
      if (
        person.starts_at &&
        person.ends_at &&
        (toCompanyTimestamp(person.ends_at) ?? '') <=
          (toCompanyTimestamp(person.starts_at) ?? '')
      ) {
        context.addIssue({
          code: 'custom',
          path: ['staff', index, 'ends_at'],
          message: 'Sfârșitul lucrului trebuie să fie după început.',
        });
      }
    });
    if (value.status === 'tentative' && !value.expires_at) {
      context.addIssue({
        code: 'custom',
        path: ['expires_at'],
        message: 'Completează termenul rezervării.',
      });
    }
    if (['confirmed', 'completed'].includes(value.status)) {
      for (const field of ['starts_at', 'ends_at'] as const) {
        if (!value[field]) {
          context.addIssue({
            code: 'custom',
            path: [field],
            message: 'Completează programul.',
          });
        }
      }
      if (Number(value.minimum_guests) < 1) {
        context.addIssue({
          code: 'custom',
          path: ['minimum_guests'],
          message: 'Completează minimul garantat.',
        });
      }
      if (Number(value.menu_price.replace(',', '.')) <= 0) {
        context.addIssue({
          code: 'custom',
          path: ['menu_price'],
          message: 'Completează prețul meniului.',
        });
      }
    }
    if (
      value.starts_at &&
      value.ends_at &&
      (toCompanyTimestamp(value.ends_at) ?? '') <=
        (toCompanyTimestamp(value.starts_at) ?? '')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: 'Sfârșitul trebuie să fie după început.',
      });
    }
  });
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
