import { errorMessageForResponse } from '@/shared/api/apiError';

test.each([
  [422, 'MAP_OUTSIDE_BIHOR', 'Locația trebuie să fie în județul Bihor. Alege un alt punct.'],
  [503, 'MAP_GOOGLE_UNAVAILABLE', 'Serviciul Google Maps nu răspunde. Încearcă din nou.'],
  [503, 'MAP_CONFIGURATION_MISSING', 'Harta nu este încă activată. Contactează administratorul.'],
])('mapeaza codul hartii %s %s fara mesaje tehnice', (status, code, message) => {
  expect(errorMessageForResponse(Number(status), { kind: 'json', value: { error: { code }, message: 'private diagnostic' } })).toBe(message);
});

test('maps a contact phone error code without exposing backend diagnostics', () => {
  expect(
    errorMessageForResponse(422, {
      kind: 'json',
      value: {
        error: { code: 'EVENT_CONTACT_PHONE_INVALID' },
        errors: { contact_phone: ['Technical phone diagnostic'] },
      },
    }),
  ).toBe('Completează un număr de telefon valid.');
});

test('maps reservation validation codes to Romanian frontend text', () => {
  expect(
    errorMessageForResponse(422, {
      kind: 'json',
      value: { error: { code: 'EVENT_VALIDATION_FAILED' } },
    }),
  ).toBe('Verifică datele rezervării și încearcă din nou.');
});

test.each(['UNKNOWN_CODE', 'constructor', '__proto__'])(
  'uses the generic fallback for unknown error code %s',
  code => {
    expect(
      errorMessageForResponse(422, {
        kind: 'json',
        value: {
          error: { code },
          message: 'Technical message',
          errors: { field: ['Technical diagnostic'] },
        },
      }),
    ).toBe('Cererea nu a putut fi procesată.');
  },
);

test('maps unexpected server exceptions to frontend-owned text', () => {
  expect(errorMessageForResponse(500, {
    kind: 'json',
    value: { error: { code: 'SERVER_ERROR' }, message: 'Private diagnostic' },
  })).toBe('A apărut o eroare pe server. Încearcă din nou.');
});

test('unknown codes and validation diagnostics never become displayed text', () => {
  expect(errorMessageForResponse(422, {
    kind: 'json',
    value: {
      error: { code: 'UNKNOWN_CODE' },
      message: 'Backend message',
      errors: { email: ['Backend field diagnostic'] },
    },
  })).toBe('Cererea nu a putut fi procesată.');
});
