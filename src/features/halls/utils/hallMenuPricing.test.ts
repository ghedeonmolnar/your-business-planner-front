import {
  hallMenuPricesForDate,
  hallMenuRulesOverlap,
} from '@/features/halls/utils/hallMenuPricing';
import { hallFormSchema } from '@/features/halls/schemas/hallFormSchema';
import {
  hallFormDefaults,
  hallSaveBody,
} from '@/features/halls/utils/hallFormValues';
import { hallFixture } from '@/features/halls/utils/hallTestFixtures';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

const weekend = {
  name: 'Weekend sezon 2027',
  starts_on: '2027-05-01',
  ends_on: '2027-09-30',
  weekdays: [5, 6],
  menu_price: '400.25',
  child_menu_price: '200.00',
};
const hall = {
  ...hallFixture,
  menu_pricing_mode: 'advanced' as const,
  menu_price: '350.00',
  child_menu_price: '180.00',
  menu_price_rules: [weekend],
};

test('alege tariful după anul, perioada inclusivă și ziua reală a evenimentului', () => {
  expect(hallMenuPricesForDate(hall, '2027-05-01')).toEqual({
    menu_price: '400.25',
    child_menu_price: '200.00',
  });
  for (const date of ['2027-05-03', '2027-04-30', '2028-05-06', ''])
    expect(hallMenuPricesForDate(hall, date).menu_price).toBe('350.00');
  expect(
    hallMenuPricesForDate(
      { ...hall, menu_price: null, child_menu_price: null },
      '2027-05-03',
    ),
  ).toEqual({ menu_price: null, child_menu_price: null });
});

test('respinge doar suprapunerile care conțin o dată aplicabilă ambelor reguli', () => {
  expect(hallMenuRulesOverlap(weekend, weekend)).toBe(true);
  expect(hallMenuRulesOverlap(weekend, { ...weekend, weekdays: [3, 4] })).toBe(
    false,
  );
  expect(
    hallMenuRulesOverlap(weekend, {
      ...weekend,
      starts_on: '2028-05-01',
      ends_on: '2028-09-30',
    }),
  ).toBe(false);
  const mondayOnly = {
    ...weekend,
    starts_on: '2027-05-03',
    ends_on: '2027-05-03',
  };
  expect(hallMenuRulesOverlap(mondayOnly, mondayOnly)).toBe(false);
});

test('validează regulile, normalizează banii și păstrează lista goală în modul simplu', () => {
  const values = hallFormDefaults(hall);
  expect(
    hallFormSchema.safeParse({ ...values, menu_price_rules: [] }).success,
  ).toBe(false);
  expect(
    hallFormSchema.safeParse({
      ...values,
      menu_price_rules: [weekend, weekend],
    }).success,
  ).toBe(false);
  expect(
    hallFormSchema.safeParse({
      ...values,
      menu_price_rules: [{ ...weekend, weekdays: [] }],
    }).success,
  ).toBe(false);
  const body = hallSaveBody(
    { ...values, menu_price_rules: [{ ...weekend, menu_price: '400,25' }] },
    [],
    'operation',
  );
  expect(
    JSON.parse(String(body.getAll('metadata')[0])).menu_price_rules[0]
      .menu_price,
  ).toBe('400.25');
  const simple = hallSaveBody(
    { ...values, menu_pricing_mode: 'simple' },
    [],
    'operation',
  );
  expect(
    JSON.parse(String(simple.getAll('metadata')[0])).menu_price_rules,
  ).toEqual([]);
});

test('tarifele sezoniere precompletează doar rezervarea nouă și păstrează contractul salvat', () => {
  expect(
    bookingFormDefaults('2027-05-01', hall.id, undefined, hall).menu_price,
  ).toBe('400.25');
  expect(
    bookingFormDefaults(
      '2027-05-01',
      hall.id,
      { ...plannerBooking, menu_price: '325.00' },
      hall,
    ).menu_price,
  ).toBe('325.00');
});

test('datele principale sunt obligatorii și duplicarea unei săli inactive produce o ciornă activă', () => {
  const values = hallFormDefaults(hallFixture);
  expect(
    hallFormSchema.safeParse({ ...values, minimum_guests: '' }).success,
  ).toBe(false);
  expect(hallFormSchema.safeParse({ ...values, address: '   ' }).success).toBe(
    false,
  );
  expect(
    hallFormDefaults({ ...hallFixture, is_active: false }, true).is_active,
  ).toBe('yes');
});
