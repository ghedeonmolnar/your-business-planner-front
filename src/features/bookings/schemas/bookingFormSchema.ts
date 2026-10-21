import { z } from 'zod';
import { toCompanyTimestamp } from '@/shared/utils/formatDate';

const amount = z
  .string()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Introdu o sumă validă.');
const count = z.string().regex(/^\d+$/, 'Introdu un număr întreg.');
const localTimestamp = z
  .string()
  .refine(
    value => !value || toCompanyTimestamp(value) !== null,
    'Folosește formatul AAAA-LL-ZZ OO:MM.',
  );
export const bookingFormSchema = z
  .object({
    hall_id: z.string().min(1, 'Alege sala.'),
    client_id: z.string().min(1, 'Alege clientul.'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege data.'),
    type: z.string(),
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
      ),
    menu_price: amount,
    menu_name: z.string(),
    agreed_advance: amount,
    advance_due_at: z.string(),
    extra_services: z.array(
      z.object({ name: z.string().min(1, 'Completează serviciul.'), amount }),
    ),
    staff: z.array(
      z.object({
        employee_id: z.string().min(1, 'Alege persoana.'),
        job_role: z.string(),
        pay_type: z.enum(['fixed', 'hourly']),
        rate: amount,
        starts_at: localTimestamp.refine(Boolean, 'Completează începutul.'),
        ends_at: localTimestamp.refine(Boolean, 'Completează sfârșitul.'),
      }),
    ),
    notes: z.string(),
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
        person.ends_at <= person.starts_at
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
    if (value.starts_at && value.ends_at && value.ends_at <= value.starts_at) {
      context.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: 'Sfârșitul trebuie să fie după început.',
      });
    }
  });
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
