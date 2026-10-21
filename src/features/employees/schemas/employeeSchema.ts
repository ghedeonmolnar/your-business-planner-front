import { z } from 'zod';
import { EmployeeGender } from '@/features/employees/types';
import {
  MAX_RATE_AMOUNT,
  nullableMoneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';
import { buildBirthDate } from '@/shared/utils/birthDate';
import { dateToIsoDate } from '@/shared/utils/dateInput';

const employeeGenderValues = ['male', 'female'] as const;

const genderField = z
  .string()
  .refine(
    (value): value is EmployeeGender =>
      employeeGenderValues.includes(value as EmployeeGender),
    'Alege sexul angajatului.',
  );

export const employeeSchema = z
  .object({
    name: z.string().trim().min(1, 'Completează numele angajatului.'),
    gender: genderField,
    hourly_rate: nullableMoneyFieldSchema({
      formatMessage: 'Tariful poate avea cel mult două zecimale.',
      maximum: MAX_RATE_AMOUNT,
      maximumMessage: 'Tariful este prea mare.',
      minimum: 0,
      minimumMessage: 'Tariful nu poate fi negativ.',
    }),
    birth_year: z.string(),
    birth_month: z.string(),
    birth_day: z.string(),
    is_active: z.boolean(),
  })
  .superRefine((values, context) => {
    const birthDate = buildBirthDate(
      values.birth_year,
      values.birth_month,
      values.birth_day,
    );
    let message: string | null = null;

    if (!values.birth_year || !values.birth_month || !values.birth_day) {
      message = 'Completează anul, luna și ziua nașterii.';
    } else if (!birthDate) {
      message = 'Completează o dată de naștere validă.';
    } else if (birthDate > dateToIsoDate(new Date())) {
      message = 'Data nașterii nu poate fi în viitor.';
    }

    if (message) {
      context.addIssue({
        code: 'custom',
        message,
        path: ['birth_day'],
      });
    }
  })
  .transform(({ birth_year, birth_month, birth_day, ...values }) => ({
    ...values,
    birth_date: buildBirthDate(birth_year, birth_month, birth_day) ?? '',
  }));

export type EmployeeFormInput = z.input<typeof employeeSchema>;
export type EmployeeFormValues = z.output<typeof employeeSchema>;

export const emptyEmployeeForm: EmployeeFormInput = {
  name: '',
  gender: '',
  hourly_rate: null,
  birth_year: '',
  birth_month: '',
  birth_day: '',
  is_active: true,
};
