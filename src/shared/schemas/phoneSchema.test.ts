import { requiredPhoneSchema } from '@/shared/schemas/phoneSchema';

test.each(['', '123', 'abc0712345678', 'https://0712345678'])(
  'respinge telefonul lipsă sau invalid: %s',
  value => {
    expect(requiredPhoneSchema.safeParse(value).success).toBe(false);
  },
);

test.each(['0712345678', '+40712345678', '00447123456789', '+33123456789'])(
  'acceptă telefonul local sau internațional: %s',
  value => {
    expect(requiredPhoneSchema.safeParse(value).success).toBe(true);
  },
);
