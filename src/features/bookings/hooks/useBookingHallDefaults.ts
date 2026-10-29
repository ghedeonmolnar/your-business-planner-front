import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { DirectoryItem } from '@/features/company/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';

type HallDefaultField = 'estimated_guests' | 'menu_price' | 'child_menu_price';

const applyHallDefault = (
  form: UseFormReturn<BookingFormValues>,
  defaults: Record<HallDefaultField, string>,
  field: HallDefaultField,
  value: string,
) => {
  if (
    form.getFieldState(field).isDirty &&
    form.getValues(field) !== defaults[field]
  ) {
    return;
  }
  defaults[field] = value;
  form.setValue(field, value);
};

export function useBookingHallDefaults(
  form: UseFormReturn<BookingFormValues>,
  halls: DirectoryItem[],
  hallId: string,
  booking?: Booking,
  recovering = false,
) {
  const hall = halls.find(item => item.id === hallId);
  const minimum = hall?.minimum_guests;
  const adultPrice = hall?.menu_price;
  const childPrice = hall?.child_menu_price;
  const historical = booking?.hall_id === hallId;
  const defaults = useRef({
    estimated_guests: form.getValues('estimated_guests') ?? '',
    menu_price: form.getValues('menu_price'),
    child_menu_price: form.getValues('child_menu_price') ?? '',
  });

  useEffect(() => {
    if (recovering || historical || minimum === undefined) return;
    form.setValue('minimum_guests', String(minimum ?? 0));
    applyHallDefault(
      form,
      defaults.current,
      'estimated_guests',
      String(minimum ?? 0),
    );
  }, [form, historical, minimum, hallId, recovering]);

  useEffect(() => {
    if (recovering || historical) return;
    if (adultPrice !== undefined) {
      applyHallDefault(form, defaults.current, 'menu_price', adultPrice ?? '0');
    }
    if (childPrice !== undefined) {
      applyHallDefault(
        form,
        defaults.current,
        'child_menu_price',
        childPrice ?? '0',
      );
    }
  }, [form, historical, adultPrice, childPrice, hallId, recovering]);

  return (id: string) => {
    if (id === form.getValues('hall_id')) return;
    for (const field of ['date', 'starts_at', 'ends_at'] as const) {
      form.setValue(field, '', { shouldDirty: true });
    }
    form.clearErrors(['date', 'starts_at', 'ends_at']);
    const selected = halls.find(item => item.id === id);
    const sameOriginalHall = booking?.hall_id === id;
    form.setValue(
      'minimum_guests',
      String(
        sameOriginalHall
          ? (booking?.minimum_guests ?? 0)
          : (selected?.minimum_guests ?? 0),
      ),
    );
    applyHallDefault(
      form,
      defaults.current,
      'estimated_guests',
      String(selected?.minimum_guests ?? 0),
    );
    applyHallDefault(
      form,
      defaults.current,
      'menu_price',
      sameOriginalHall
        ? (booking?.menu_price ?? '0')
        : (selected?.menu_price ?? '0'),
    );
    applyHallDefault(
      form,
      defaults.current,
      'child_menu_price',
      sameOriginalHall
        ? (booking?.child_menu_price ?? '0')
        : (selected?.child_menu_price ?? '0'),
    );
  };
}
