import { z } from 'zod';
import {
  MAX_RATE_AMOUNT,
  moneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';

export const MINUTES_PER_HOUR = 60;
export const MAX_OVERTIME_HOURS = 24;
export const OVERTIME_HOURS_DECIMAL_PLACES = 2;

export const normalizeOvertimeDecimal = (value: string | number) =>
  typeof value === 'string' ? value.trim().replace(',', '.') : value;

const hoursSchema = moneyFieldSchema({
  formatMessage: 'Completează numărul de ore cu cel mult două zecimale.',
  maximum: MAX_OVERTIME_HOURS,
  maximumMessage: 'Prelungirea poate avea cel mult 24 de ore.',
  minimum: 0,
  minimumExclusive: true,
  minimumMessage: 'Completează un număr pozitiv de ore.',
});

const hourlyRateSchema = moneyFieldSchema({
  formatMessage: 'Tariful poate avea cel mult două zecimale.',
  maximum: MAX_RATE_AMOUNT,
  maximumMessage: 'Tariful este prea mare.',
  minimum: 0,
  minimumExclusive: true,
  minimumMessage: 'Completează un tarif pozitiv.',
});

export const paymentOvertimeSchema = z
  .object({
    has_overtime: z.enum(['no', 'yes']),
    hours: z.union([z.string(), z.number()]),
    hourly_rate: z.union([z.string(), z.number()]),
    scope: z.enum(['all', 'selected']),
    employee_ids: z.array(z.string().min(1)),
  })
  .superRefine((values, context) => {
    if (values.has_overtime === 'no') {
      return;
    }

    for (const [field, schema] of [
      ['hours', hoursSchema],
      ['hourly_rate', hourlyRateSchema],
    ] as const) {
      const result = schema.safeParse(normalizeOvertimeDecimal(values[field]));

      if (!result.success) {
        result.error.issues.forEach(issue => {
          context.addIssue({ ...issue, path: [field] });
        });
      }
    }

    if (values.scope === 'selected' && values.employee_ids.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['employee_ids'],
        message: 'Alege cel puțin un animator.',
      });
    }
  });

export type PaymentOvertimeValues = z.infer<typeof paymentOvertimeSchema>;
