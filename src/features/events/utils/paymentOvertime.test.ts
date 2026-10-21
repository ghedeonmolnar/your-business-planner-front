import { overtimeAmount } from '@/features/events/utils/paymentOvertime';

test('calculează prelungirea doar pentru animatorii selectați', () => {
  expect(
    overtimeAmount({
      duration_minutes: 90,
      hourly_rate: 100,
      employee_ids: ['one', 'two'],
    }),
  ).toBe(300);
  expect(
    overtimeAmount({
      duration_minutes: 90,
      hourly_rate: 100,
      employee_ids: ['two'],
    }),
  ).toBe(150);
});

test('rotunjește la ban suma fiecărui animator înainte de total', () => {
  expect(
    overtimeAmount({
      duration_minutes: 30,
      hourly_rate: 0.01,
      employee_ids: ['one', 'two'],
    }),
  ).toBe(0.02);
});
