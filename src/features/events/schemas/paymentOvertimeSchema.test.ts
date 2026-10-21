import { paymentOvertimeSchema } from '@/features/events/schemas/paymentOvertimeSchema';

const values = {
  has_overtime: 'yes',
  hours: '1,5',
  hourly_rate: '100,25',
  scope: 'all',
  employee_ids: [],
};

test('fără prelungire nu cere ore și tarif', () => {
  expect(
    paymentOvertimeSchema.safeParse({
      ...values,
      has_overtime: 'no',
      hours: '',
      hourly_rate: '',
    }).success,
  ).toBe(true);
});

test('acceptă ore fracționare și virgulă zecimală', () => {
  expect(paymentOvertimeSchema.safeParse(values).success).toBe(true);
  expect(
    paymentOvertimeSchema.safeParse({ ...values, hours: '1.1' }).success,
  ).toBe(true);
});

test.each([
  { hours: '0' },
  { hours: '25' },
  { hours: '1e2' },
  { hourly_rate: '0' },
  { hourly_rate: '1e3' },
  { hourly_rate: '10.001' },
  { scope: 'selected' },
])('respinge datele incomplete sau invalide: %j', invalid => {
  expect(
    paymentOvertimeSchema.safeParse({ ...values, ...invalid }).success,
  ).toBe(false);
});
