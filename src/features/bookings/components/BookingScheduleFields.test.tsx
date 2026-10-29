import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingScheduleFields } from '@/features/bookings/components/BookingScheduleFields';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function Schedule({ editing }: { editing: boolean }) {
  const form = useAppForm<BookingFormValues>({
    defaultValues: bookingFormDefaults('2027-11-13'),
  });
  return (
    <BookingScheduleFields
      form={form}
      halls={[]}
      hallId=""
      bookingId={editing ? 'booking-1' : undefined}
    />
  );
}

beforeEach(() => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, plannerAccount)
        : String(url).endsWith('/catalogs')
          ? jsonResponse(200, catalogsFixture)
          : paginatedResponse([]),
    ),
  ) as typeof globalThis.fetch;
});

test.each([false, true])(
  'mesajul urmărește starea, iar anularea este disponibilă doar la editare: %s',
  async editing => {
    const { renderer, unmount } = await renderWithProviders(
      <Schedule editing={editing} />,
    );
    const status = () =>
      renderer.root
        .findAllByType(SearchableSelect)
        .find(field => field.props.label === 'Stare rezervare')!;
    try {
      const options = status().props.options.map(
        (option: { id: string }) => option.id,
      );
      expect(options.includes('cancelled')).toBe(editing);
      expect(options).not.toContain('expired');
      expect(renderedText(renderer)).toContain('sala rămâne disponibilă.');
      await ReactTestRenderer.act(async () =>
        status().props.onChange(['confirmed']),
      );
      expect(renderedText(renderer)).not.toContain('sala rămâne disponibilă.');
      await ReactTestRenderer.act(async () =>
        status().props.onChange(['tentative']),
      );
      expect(renderedText(renderer)).toContain('sala rămâne disponibilă.');
    } finally {
      await unmount();
    }
  },
);
