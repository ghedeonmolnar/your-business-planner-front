import { z } from 'zod';
import { BOOKING_SERVICE_PRICING_TYPES } from '@/features/bookings/types';
import { companyNow, toCompanyTimestamp } from '@/shared/utils/formatDate';
import { normalizePhone } from '@/shared/utils/contactLinks';
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
    client_id: z.string(),
    client_phone: z
      .string()
      .max(64, 'Folosește cel mult 64 de caractere.')
      .refine(
        value => !value.trim() || normalizePhone(value) !== null,
        'Introdu un număr de telefon valid.',
      )
      .optional(),
    client_name: label.optional(),
    date: z.iso.date('Alege o dată validă.'),
    type: z.string().min(1, 'Alege tipul evenimentului.'),
    status: z.enum(['tentative', 'confirmed', 'completed', 'cancelled']),
    starts_at: localTimestamp,
    ends_at: localTimestamp,
    expires_at: localTimestamp,
    minimum_guests: count,
    estimated_guests: count.or(z.literal('')).optional(),
    child_guests: count.or(z.literal('')).optional(),
    child_menu_price: amount.or(z.literal('')).optional(),
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
    agreed_advance: amount.or(z.literal('')),
    advance_received_amount: amount.or(z.literal('')).optional(),
    advance_received_method: z
      .enum(['', 'cash', 'card', 'transfer'])
      .optional(),
    advance_received_at: z.iso.date('Alege o dată validă.').optional(),
    advance_due_at: z
      .string()
      .refine(
        value => !value || z.iso.date().safeParse(value).success,
        'Alege o dată validă.',
      ),
    extra_services: z
      .array(
        z.object({
          name: label.min(1, 'Completează serviciul.'),
          amount,
          pricing_type: z.enum(BOOKING_SERVICE_PRICING_TYPES).optional(),
        }),
      )
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
    if (!value.client_id && !value.client_phone?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['client_phone'],
        message: 'Completează numărul de telefon al clientului.',
      });
    }
    if (Boolean(value.starts_at) !== Boolean(value.ends_at)) {
      context.addIssue({
        code: 'custom',
        path: [value.starts_at ? 'ends_at' : 'starts_at'],
        message: 'Completează ambele ore sau lasă programul necompletat.',
      });
    }
    if (
      Number(value.child_guests) > 0 &&
      Number(value.child_menu_price?.replace(',', '.') || 0) <= 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['child_menu_price'],
        message: 'Completează prețul meniului pentru copii.',
      });
    }
    if (value.starts_at && value.starts_at.slice(0, 10) !== value.date) {
      context.addIssue({
        code: 'custom',
        path: ['starts_at'],
        message: 'Începutul trebuie să fie în data evenimentului.',
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
      if (
        Math.max(
          Number(value.minimum_guests),
          Number(value.final_guests || value.estimated_guests || 0),
        ) < 1
      ) {
        context.addIssue({
          code: 'custom',
          path: [
            value.estimated_guests === undefined
              ? 'minimum_guests'
              : 'estimated_guests',
          ],
          message: 'Completează numărul estimat de meniuri.',
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
export const bookingCreationFormSchema = bookingFormSchema.refine(
  value => value.date >= companyNow().format('YYYY-MM-DD'),
  {
    path: ['date'],
    message: 'Alege ziua de azi sau o dată viitoare.',
  },
);

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
