import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingExtraServiceCard } from '@/features/bookings/components/BookingExtraServiceCard';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function Service() {
  const form = useAppForm<BookingFormValues>({
    defaultValues: {
      ...bookingFormDefaults('2027-11-13'),
      extra_services: [{ name: 'Extra', amount: '10', pricing_type: 'fixed' }],
    },
  });
  return <BookingExtraServiceCard form={form} index={0} onRemove={jest.fn()} />;
}

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
});

test.each([
  ['per_child_menu', 'Extra pe meniu copil (lei)'],
  ['per_all_menus', 'Extra pe meniu (lei)'],
])(
  'selectorul acceptă %s și afișează eticheta potrivită',
  async (type, label) => {
    const { renderer, unmount } = await renderWithProviders(<Service />);
    try {
      const select = renderer.root.findByType(SearchableSelect);
      expect(select.props.options).toEqual(
        expect.arrayContaining([
          { id: 'per_child_menu', name: 'Extra pe meniu (copii)' },
          { id: 'per_all_menus', name: 'Extra pe meniu (adulți și copii)' },
        ]),
      );
      await ReactTestRenderer.act(async () => select.props.onChange([type]));
      const amount = renderer.root
        .findAllByType(ControlledTextField)
        .find(field => field.props.name === 'extra_services.0.amount');
      expect(amount?.props.label).toBe(label);
    } finally {
      await unmount();
    }
  },
);
