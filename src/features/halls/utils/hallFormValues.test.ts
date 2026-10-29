import {
  hallFormDefaults,
  hallSaveBody,
} from '@/features/halls/utils/hallFormValues';
import { hallFixture } from '@/features/halls/utils/hallTestFixtures';
import { hallFormSchema } from '@/features/halls/schemas/hallFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('prețurile implicite pentru adulți și copii rămân zecimale și pot fi necompletate', () => {
  const values = {
    ...hallFormDefaults(hallFixture),
    menu_price: '350,25',
    child_menu_price: '150.50',
  };
  expect(hallFormSchema.safeParse(values).success).toBe(true);
  const body = hallSaveBody(values, [], 'operation-id');
  expect(JSON.parse(String(body.getAll('metadata')[0]))).toMatchObject({
    menu_price: '350.25',
    child_menu_price: '150.50',
  });
  expect(
    hallFormSchema.safeParse({ ...values, child_menu_price: '1.001' }).success,
  ).toBe(false);
  expect(
    hallFormSchema.safeParse({
      ...values,
      menu_price: '',
      child_menu_price: '',
    }).success,
  ).toBe(true);
});

test('duplicarea pregătește datele comerciale fără note, identitate sau istoric', () => {
  const values = hallFormDefaults(hallFixture, true);
  expect(values.name).toBe('Sala test (copie)');
  expect(values.amenities).toEqual(['Scenă']);
  expect(values.internal_notes).toBe('');
  expect(values).not.toHaveProperty('id');
  expect(values).not.toHaveProperty('version');
  expect(values).not.toHaveProperty('next_bookings');
  expect(hallFormSchema.safeParse(values).success).toBe(true);
});

test('validează minimul, programul peste miezul nopții și câmpurile opționale fără valori inventate', () => {
  const empty = hallFormDefaults();
  expect(empty.minimum_guests).toBe('');
  expect(
    empty.business_hours.every(hours => !hours.enabled && !hours.start_time),
  ).toBe(true);
  const values = hallFormDefaults(hallFixture);
  expect(
    hallFormSchema.safeParse({ ...values, minimum_guests: '351' }).success,
  ).toBe(false);
  expect(
    hallFormSchema.safeParse({
      ...values,
      business_hours: values.business_hours.map(hours => ({
        ...hours,
        ends_next_day: false,
      })),
    }).success,
  ).toBe(false);
  expect(hallFormSchema.safeParse(values).success).toBe(true);
});

test('trimite coperta nouă și păstrează imaginile existente fără a trimite URL-urile private', () => {
  const body = hallSaveBody(
    hallFormDefaults(hallFixture),
    [
      {
        key: 'new',
        uri: 'file:///new.jpg',
        file: { uri: 'file:///new.jpg', name: 'new.jpg', type: 'image/jpeg' },
      },
      {
        key: 'existing',
        imageId: 'image-id',
        uri: 'https://private.test/signed',
      },
    ],
    'operation-id',
    1,
  );
  const metadata = JSON.parse(String(body.getAll('metadata')[0]));
  expect(metadata.cover_upload_index).toBe(0);
  expect(metadata.image_ids).toEqual(['image-id']);
  expect(metadata.version).toBe(1);
  expect(JSON.stringify(metadata)).not.toContain('private.test');
  expect(body.getAll('_method')[0]).toBe('PUT');
});

test('minimul sălii precompletează numai un contract nou și păstrează snapshotul existent', () => {
  expect(
    bookingFormDefaults('2026-10-24', 'hall-1', undefined, {
      minimum_guests: 150,
    }).minimum_guests,
  ).toBe('150');
  expect(
    bookingFormDefaults(
      '2026-10-24',
      'hall-1',
      { ...plannerBooking, minimum_guests: 200 },
      { minimum_guests: 150 },
    ).minimum_guests,
  ).toBe('200');
});
