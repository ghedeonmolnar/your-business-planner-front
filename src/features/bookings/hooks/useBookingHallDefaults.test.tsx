import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useForm, useWatch, UseFormReturn } from 'react-hook-form';
import { useBookingHallDefaults } from '@/features/bookings/hooks/useBookingHallDefaults';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { DirectoryItem } from '@/features/company/types';
import {
  renderWithProviders,
  jsonResponse,
} from '@/shared/test/renderWithProviders';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

type ProbeControls = {
  form?: UseFormReturn<BookingFormValues>;
  setHalls?: (halls: DirectoryItem[]) => void;
};
function Probe({ controls }: { controls: ProbeControls }) {
  const form = useForm<BookingFormValues>({
    defaultValues: bookingFormDefaults('2027-11-13', 'hall-1'),
  });
  const [halls, setHalls] = React.useState<DirectoryItem[]>([]);
  const hallId = useWatch({ control: form.control, name: 'hall_id' });
  useBookingHallDefaults(form, halls, hallId);
  controls.form = form;
  controls.setHalls = setHalls;
  return null;
}
const firstHall = {
  id: 'hall-1',
  name: 'Sala',
  menu_price: '350.00',
  child_menu_price: '150.00',
};

test('schimbarea datei aplică regula sezonieră fără a suprascrie prețul negociat', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
  const controls: ProbeControls = {};
  const { unmount } = await renderWithProviders(<Probe controls={controls} />);
  try {
    await ReactTestRenderer.act(async () =>
      controls.setHalls?.([
        {
          ...firstHall,
          menu_pricing_mode: 'advanced',
          menu_price_rules: [
            {
              name: 'Weekend 2027',
              starts_on: '2027-05-01',
              ends_on: '2027-09-30',
              weekdays: [5, 6],
              menu_price: '400.00',
              child_menu_price: '200.00',
            },
          ],
        },
      ]),
    );
    await ReactTestRenderer.act(async () =>
      controls.form?.setValue('date', '2027-05-01'),
    );
    expect(controls.form?.getValues('menu_price')).toBe('400.00');
    await ReactTestRenderer.act(async () =>
      controls.form?.setValue('date', '2027-05-03'),
    );
    expect(controls.form?.getValues('menu_price')).toBe('350.00');
    await ReactTestRenderer.act(async () =>
      controls.form?.setValue('menu_price', '325.00', { shouldDirty: true }),
    );
    await ReactTestRenderer.act(async () =>
      controls.form?.setValue('date', '2027-05-01'),
    );
    expect(controls.form?.getValues('menu_price')).toBe('325.00');
    expect(controls.form?.getValues('child_menu_price')).toBe('200.00');
  } finally {
    await unmount();
  }
});
