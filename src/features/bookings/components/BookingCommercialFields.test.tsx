import React, { useState } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { BookingCommercialFields } from '@/features/bookings/components/BookingCommercialFields';
import { useBookingHallDefaults } from '@/features/bookings/hooks/useBookingHallDefaults';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { Booking } from '@/features/bookings/types';
import { DirectoryItem } from '@/features/company/types';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { IconButton } from '@/shared/components/IconButton';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

type ProbeControls = {
  form?: UseFormReturn<BookingFormValues>;
  setHalls?: (halls: DirectoryItem[]) => void;
  selectHall?: (id: string) => void;
};
function Probe({
  controls,
  booking,
}: {
  controls: ProbeControls;
  booking?: Booking;
}) {
  const form = useForm<BookingFormValues>({
    defaultValues: bookingFormDefaults('2027-11-13', 'hall-1', booking),
  });
  const [halls, setHalls] = useState<DirectoryItem[]>([]);
  const hallId = useWatch({ control: form.control, name: 'hall_id' });
  const select = useBookingHallDefaults(form, halls, hallId, booking);
  controls.form = form;
  controls.setHalls = setHalls;
  controls.selectHall = id => {
    select(id);
    form.setValue('hall_id', id);
  };
  return <BookingCommercialFields form={form} />;
}

const firstHall = {
  id: 'hall-1',
  name: 'Sala test',
  minimum_guests: 100,
  menu_price: '350.00',
  child_menu_price: '150.00',
};
const secondHall = {
  id: 'hall-2',
  name: 'Altă sală',
  minimum_guests: 80,
  menu_price: '300.00',
  child_menu_price: '120.00',
};

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
});

test('minimul este informativ, iar prețurile sosite ulterior nu suprascriu negocierea', async () => {
  const controls: ProbeControls = {};
  const { renderer, unmount } = await renderWithProviders(
    <Probe controls={controls} />,
  );
  try {
    await ReactTestRenderer.act(async () =>
      controls.setHalls?.([firstHall, secondHall]),
    );
    expect(controls.form?.getValues()).toMatchObject({
      minimum_guests: '100',
      estimated_guests: '100',
      menu_price: '350.00',
      child_menu_price: '150.00',
      final_guests: '',
      child_guests: '',
    });
    expect(
      renderer.root
        .findAllByType(ControlledTextField)
        .some(field => field.props.name === 'minimum_guests'),
    ).toBe(false);
    expect(renderedText(renderer)).toContain('100 meniuri pentru adulți');
    await ReactTestRenderer.act(async () => {
      controls.form?.setValue('menu_price', '325.25', { shouldDirty: true });
      controls.form?.setValue('estimated_guests', '125', { shouldDirty: true });
      controls.setHalls?.([
        { ...firstHall, minimum_guests: 110, menu_price: '400.00' },
        secondHall,
      ]);
    });
    expect(controls.form?.getValues()).toMatchObject({
      minimum_guests: '110',
      estimated_guests: '125',
      menu_price: '325.25',
    });
    await ReactTestRenderer.act(async () => controls.selectHall?.('hall-2'));
    expect(controls.form?.getValues()).toMatchObject({
      minimum_guests: '80',
      estimated_guests: '125',
      menu_price: '325.25',
      child_menu_price: '120.00',
      date: '',
    });
    await ReactTestRenderer.act(async () => {
      controls.form?.setValue('child_menu_price', '110.00', { shouldDirty: true });
      controls.setHalls?.([
        firstHall,
        { ...secondHall, child_menu_price: '130.00' },
      ]);
    });
    expect(controls.form?.getValues('child_menu_price')).toBe('110.00');
  } finally {
    await unmount();
  }
});

test('editarea păstrează prețurile și minimul rezervării existente', async () => {
  const controls: ProbeControls = {};
  const booking = {
    ...plannerBooking,
    minimum_guests: 90,
    estimated_guests: 120,
    menu_price: '280.00',
    child_menu_price: '100.00',
  };
  const { unmount } = await renderWithProviders(
    <Probe controls={controls} booking={booking} />,
  );
  try {
    await ReactTestRenderer.act(async () => controls.setHalls?.([firstHall]));
    expect(controls.form?.getValues()).toMatchObject({
      minimum_guests: '90',
      estimated_guests: '120',
      menu_price: '280.00',
      child_menu_price: '100.00',
    });
  } finally {
    await unmount();
  }
});

test('serviciile sunt carduri distincte, iar eliminarea unuia păstrează restul valorilor', async () => {
  const controls: ProbeControls = {};
  const { renderer, unmount } = await renderWithProviders(
    <Probe controls={controls} />,
  );
  const add = () =>
    renderer.root
      .findAllByType(AppButton)
      .find(button => button.props.label === 'Adaugă serviciu')
      ?.props.onPress();
  try {
    await ReactTestRenderer.act(async () => add());
    await ReactTestRenderer.act(async () => add());
    await ReactTestRenderer.act(async () => {
      controls.form?.setValue('extra_services.0.name', 'Decor');
      controls.form?.setValue('extra_services.1.name', 'Photo booth');
      controls.form?.setValue('extra_services.1.amount', '500.25');
    });
    expect(renderedText(renderer)).toMatch(/Serviciu suplimentar\s+1/);
    expect(renderedText(renderer)).toMatch(/Serviciu suplimentar\s+2/);
    await ReactTestRenderer.act(async () =>
      renderer.root
        .findAllByType(IconButton)
        .find(
          button => button.props.accessibilityLabel === 'Elimină serviciul 1',
        )
        ?.props.onPress(),
    );
    expect(controls.form?.getValues('extra_services')).toEqual([
      { name: 'Photo booth', amount: '500.25' },
    ]);
  } finally {
    await unmount();
  }
});
