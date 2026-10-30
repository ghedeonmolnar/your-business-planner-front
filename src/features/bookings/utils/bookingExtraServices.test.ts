import {
  bookingCommercialAmounts,
  bookingServiceAmountLabel,
} from '@/features/bookings/utils/bookingExtraServices';
import { BookingExtraService } from '@/features/bookings/types';

const services: BookingExtraService[] = [
  { name: 'Candy bar', amount: '10.00', pricing_type: 'per_menu' },
  { name: 'Decor', amount: '5000.00', pricing_type: 'fixed' },
];
const booking = {
  minimum_guests: 100,
  estimated_guests: 100,
  menu_price: '120.00',
  extra_services: services,
};

test('adaugă tariful pe meniu numai adulților și prețul unic o singură dată', () => {
  expect(bookingCommercialAmounts(booking)).toEqual({
    adultMenus: 100,
    adultMenuPrice: 130,
    childMenuPrice: 0,
    total: 18000,
  });
  expect(
    bookingCommercialAmounts({
      ...booking,
      final_guests: 120,
      child_guests: 5,
      child_menu_price: '60.00',
    }).total,
  ).toBe(20900);
  expect(
    bookingCommercialAmounts({
      ...booking,
      final_guests: 80,
      child_guests: 5,
      child_menu_price: '60.00',
    }).total,
  ).toBe(18300);
  expect(bookingCommercialAmounts({ ...booking, final_guests: 0 }).total).toBe(
    18000,
  );
});

test.each([
  ['per_child_menu', 120, 70, 17700],
  ['per_all_menus', 130, 70, 18700],
] as const)(
  'aplică %s categoriei alese și recalculează după numărul copiilor',
  (pricing_type, adultMenuPrice, childMenuPrice, total) => {
    const values = {
      ...booking,
      child_guests: 10,
      child_menu_price: '60.00',
      extra_services: [
        { name: 'Extra', amount: '10.00', pricing_type },
        services[1],
      ],
    };
    expect(bookingCommercialAmounts(values)).toEqual({
      adultMenus: 100,
      adultMenuPrice,
      childMenuPrice,
      total,
    });
    expect(
      bookingCommercialAmounts({ ...values, child_guests: null }).total,
    ).toBe(100 * adultMenuPrice + 5000);
    expect(bookingServiceAmountLabel(values.extra_services[0])).toContain(
      pricing_type === 'per_child_menu'
        ? '/ meniu copil'
        : '/ meniu (adulți și copii)',
    );
  },
);

test('serviciul istoric este preț unic, iar suplimentele păstrează banii exacți', () => {
  expect(
    bookingCommercialAmounts({
      ...booking,
      extra_services: [{ name: 'Decor', amount: '5000.00' }],
    }).total,
  ).toBe(17000);
  expect(
    bookingCommercialAmounts({
      ...booking,
      extra_services: [
        { name: 'Extra', amount: '0.15', pricing_type: 'per_menu' },
      ],
    }).total,
  ).toBe(12015);
  expect(bookingServiceAmountLabel(services[0])).toBe('10 lei / meniu adult');
  expect(bookingServiceAmountLabel(services[1])).toBe('5.000 lei · preț unic');
});
