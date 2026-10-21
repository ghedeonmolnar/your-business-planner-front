import { toEventFormValues } from '@/features/events/components/eventForm/eventFormConfig';
import { eventFixture } from '@/shared/test/apiFixtures';

test('prefills the contact phone independently of the informational channel', () => {
  expect(
    toEventFormValues({
      ...eventFixture,
      communication_channel: 'facebook',
      contact_value: 'old.profile',
    }),
  ).toMatchObject({
    communication_channel: 'facebook',
    contact_phone: '0712345678',
    legacy_contact_allowed: false,
  });
});

test('preserves phone contacts from legacy events', () => {
  expect(
    toEventFormValues({ ...eventFixture, contact_phone: undefined }),
  ).toMatchObject({
    contact_phone: '0712345678',
    legacy_contact_allowed: false,
  });
});

test('allows editing legacy events that have no phone', () => {
  expect(
    toEventFormValues({
      ...eventFixture,
      communication_channel: 'facebook',
      contact_value: 'old.profile',
      contact_phone: null,
    }),
  ).toMatchObject({ contact_phone: '', legacy_contact_allowed: true });
});
