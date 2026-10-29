import React from 'react';
import { useForm } from 'react-hook-form';
import { BookingReviewFields } from '@/features/bookings/components/BookingReviewFields';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { Booking } from '@/features/bookings/types';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import {
  renderWithProviders,
  jsonResponse,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function Probe({
  booking,
  withTimes = true,
}: {
  booking?: Booking;
  withTimes?: boolean;
}) {
  const form = useForm<BookingFormValues>({
    defaultValues: {
      ...bookingFormDefaults('2026-11-19', 'hall-1', booking),
      starts_at: withTimes ? '2026-11-19 20:00' : '',
      ends_at: withTimes ? '2026-11-20 07:00' : '',
      minimum_guests: '200',
      estimated_guests: '200',
      menu_price: '300',
      extra_services: [
        { name: 'Candy bar', amount: '10', pricing_type: 'per_menu' },
      ],
    },
  });
  return (
    <BookingReviewFields
      form={form}
      booking={booking}
      hallName="Sala Imperial"
      clientName="Client test"
    />
  );
}

test('rezervarea fără ore păstrează data evenimentului în recapitulare', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <Probe withTimes={false} />,
  );
  try {
    expect(renderedText(renderer)).toContain('19 Noiembrie, 2026');
    expect(renderedText(renderer)).toContain('Orele se completează ulterior.');
  } finally {
    await unmount();
  }
});

test.each([false, true])(
  'recapitularea arată programul complet și costurile, fără minim sau personal, editare: %s',
  async editing => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(200, plannerAccount)),
    ) as typeof globalThis.fetch;
    const { renderer, unmount } = await renderWithProviders(
      <Probe booking={editing ? plannerBooking : undefined} />,
    );
    try {
      const text = renderedText(renderer);
      expect(text).toContain('joi 19 noiembrie 2026 ora 20:00');
      expect(text).toContain('vineri 20 noiembrie 2026 ora 07:00');
      expect(text).toContain('Meniuri și costuri');
      expect(text).toContain('62.000 lei');
      expect(text).toContain('10 lei / meniu adult');
      expect(text).not.toContain('Minimul sălii');
      expect(text).not.toContain('Personal alocat');
      expect(text.includes('Meniuri confirmate')).toBe(editing);
      expect(text).toContain('Note interne');
    } finally {
      await unmount();
    }
  },
);
