import {
  Booking,
  BookingExtraService,
  BookingServicePricing,
  BOOKING_SERVICE_PRICING_TYPES,
} from '@/features/bookings/types';
import { formatExactMoney, toCents } from '@/shared/utils/money';

const pricingCopy: Record<
  BookingServicePricing,
  { name: string; amountLabel: string; hint: string; unit: string }
> = {
  fixed: {
    name: 'Preț unic',
    amountLabel: 'Preț unic (lei)',
    hint: '',
    unit: ' · preț unic',
  },
  per_menu: {
    name: 'Extra pe meniu (adulți)',
    amountLabel: 'Extra pe meniu adult (lei)',
    hint: 'Se adaugă la prețul fiecărui meniu pentru adulți. Meniurile pentru copii rămân la prețul lor.',
    unit: ' / meniu adult',
  },
  per_child_menu: {
    name: 'Extra pe meniu (copii)',
    amountLabel: 'Extra pe meniu copil (lei)',
    hint: 'Se adaugă la prețul fiecărui meniu pentru copii. Meniurile pentru adulți rămân la prețul lor.',
    unit: ' / meniu copil',
  },
  per_all_menus: {
    name: 'Extra pe meniu (adulți și copii)',
    amountLabel: 'Extra pe meniu (lei)',
    hint: 'Se adaugă la prețul fiecărui meniu, atât pentru adulți, cât și pentru copii.',
    unit: ' / meniu (adulți și copii)',
  },
};

export const bookingServicePricingCopy = (type?: BookingServicePricing) =>
  pricingCopy[type ?? 'fixed'];
export const bookingServicePricingOptions = BOOKING_SERVICE_PRICING_TYPES.map(
  id => ({ id, name: pricingCopy[id].name }),
);
export const serviceAppliesToAdultMenus = (type?: BookingServicePricing) =>
  type === 'per_menu' || type === 'per_all_menus';
export const serviceAppliesToChildMenus = (type?: BookingServicePricing) =>
  type === 'per_child_menu' || type === 'per_all_menus';
export const bookingServiceAmountLabel = (service: BookingExtraService) =>
  `${formatExactMoney(service.amount)}${bookingServicePricingCopy(service.pricing_type).unit}`;

export const bookingCommercialAmounts = (
  booking: Pick<
    Booking,
    | 'menu_price'
    | 'minimum_guests'
    | 'estimated_guests'
    | 'final_guests'
    | 'child_guests'
    | 'child_menu_price'
    | 'extra_services'
  >,
) => {
  let adultPrice = toCents(booking.menu_price);
  let childPrice = toCents(booking.child_menu_price);
  let fixedServices = 0;
  for (const service of booking.extra_services ?? []) {
    const amount = toCents(service.amount);
    if (serviceAppliesToAdultMenus(service.pricing_type)) adultPrice += amount;
    if (serviceAppliesToChildMenus(service.pricing_type)) childPrice += amount;
    if (!service.pricing_type || service.pricing_type === 'fixed')
      fixedServices += amount;
  }
  const adultMenus = Math.max(
    booking.minimum_guests ?? 0,
    booking.final_guests ??
      booking.estimated_guests ??
      booking.minimum_guests ??
      0,
  );
  const total =
    adultMenus * adultPrice +
    (booking.child_guests ?? 0) * childPrice +
    fixedServices;
  return {
    adultMenus,
    adultMenuPrice: adultPrice / 100,
    childMenuPrice: childPrice / 100,
    total: total / 100,
  };
};
