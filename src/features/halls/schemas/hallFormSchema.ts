import { z } from 'zod';

export const MAX_HALL_PHOTOS = 10;
export const MAX_HALL_PHOTO_BYTES = 4 * 1024 * 1024;
export const MAX_HALL_AMENITIES = 50;
const MAX_HALL_GUESTS = 100_000;
const MAX_ORGANIZATION_MINUTES = 10_080;
const optionalCount = z
  .string()
  .refine(
    value =>
      !value || (/^\d+$/.test(value) && Number(value) <= MAX_HALL_GUESTS),
    'Introdu un număr întreg de cel mult 100.000.',
  );
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
export const hallFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Completează numele sălii.')
      .max(255, 'Folosește cel mult 255 de caractere.'),
    capacity: z
      .string()
      .regex(/^\d+$/, 'Introdu un număr întreg.')
      .refine(
        value => Number(value) >= 1 && Number(value) <= MAX_HALL_GUESTS,
        'Capacitatea trebuie să fie între 1 și 100.000.',
      ),
    minimum_guests: optionalCount.refine(
      value => !value || Number(value) > 0,
      'Minimul trebuie să fie pozitiv.',
    ),
    address: z.string().trim().max(255, 'Folosește cel mult 255 de caractere.'),
    description: z
      .string()
      .trim()
      .max(10_000, 'Folosește cel mult 10.000 de caractere.'),
    internal_notes: z
      .string()
      .trim()
      .max(20_000, 'Folosește cel mult 20.000 de caractere.'),
    area_sqm: z
      .string()
      .refine(
        value =>
          !value ||
          (/^\d+([.,]\d{1,2})?$/.test(value) &&
            Number(value.replace(',', '.')) > 0 &&
            Number(value.replace(',', '.')) <= 99_999_999.99),
        'Introdu o suprafață validă.',
      ),
    arrangement: z
      .string()
      .trim()
      .max(255, 'Folosește cel mult 255 de caractere.'),
    is_active: z.enum(['yes', 'no']),
    amenities: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Facilitatea trebuie să aibă un nume.')
          .max(100, 'Numele facilității poate avea cel mult 100 de caractere.'),
      )
      .max(MAX_HALL_AMENITIES, 'Poți selecta cel mult 50 de facilități.'),
    setup_minutes: optionalCount.refine(
      value => !value || Number(value) <= MAX_ORGANIZATION_MINUTES,
      'Folosește cel mult 10.080 de minute.',
    ),
    cleanup_minutes: optionalCount.refine(
      value => !value || Number(value) <= MAX_ORGANIZATION_MINUTES,
      'Folosește cel mult 10.080 de minute.',
    ),
    business_hours: z
      .array(
        z.object({
          weekday: z.number().int().min(0).max(6),
          enabled: z.boolean(),
          start_time: z.string(),
          end_time: z.string(),
          ends_next_day: z.boolean(),
        }),
      )
      .length(7),
  })
  .superRefine((values, context) => {
    if (
      values.minimum_guests &&
      Number(values.minimum_guests) > Number(values.capacity)
    )
      context.addIssue({
        code: 'custom',
        path: ['minimum_guests'],
        message: 'Minimul nu poate depăși capacitatea.',
      });
    values.business_hours.forEach((hours, index) => {
      if (!hours.enabled) return;
      for (const field of ['start_time', 'end_time'] as const)
        if (!timePattern.test(hours[field]))
          context.addIssue({
            code: 'custom',
            path: ['business_hours', index, field],
            message: 'Folosește formatul HH:mm.',
          });
      if (!hours.ends_next_day && hours.end_time <= hours.start_time)
        context.addIssue({
          code: 'custom',
          path: ['business_hours', index, 'end_time'],
          message:
            'Sfârșitul trebuie să fie după început sau în ziua următoare.',
        });
    });
  });
export type HallFormValues = z.infer<typeof hallFormSchema>;
