import {
  supportEmail,
  supportPhone,
} from '@/features/company/utils/supportContact';

test('acceptă datele valide de suport și normalizează numărul pentru apelare', () => {
  expect(supportEmail(' contact@example.test ')).toBe('contact@example.test');
  expect(supportPhone('+40 (732) 652-339')).toBe('+40732652339');
});

test.each([
  null,
  undefined,
  '',
  'email invalid',
  'contact@example.test?bcc=other@example.test',
  'contact@example.test\r\nBcc:other@example.test',
])('respinge o adresă de suport invalidă: %s', value =>
  expect(supportEmail(value)).toBeNull(),
);

test.each([
  null,
  undefined,
  '',
  '123',
  '1234567890123456',
  '0732652339;123',
  '0732652339?body=text',
  '*123#',
  'https://example.test',
])('respinge un număr de suport invalid: %s', value =>
  expect(supportPhone(value)).toBeNull(),
);
