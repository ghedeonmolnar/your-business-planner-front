import { bookingMessage } from '@/features/bookings/utils/bookingMessage';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';

test('exclude notele interne și diferențiază meniurile neconfirmate de zero', () => {
  const pending = bookingMessage(
    { ...plannerBooking, notes: 'Notă privată' },
    'Restaurant test',
  );
  expect(pending).not.toContain('Notă privată');
  expect(pending).not.toContain('Meniuri comandate: 0');
  expect(bookingMessage({ ...plannerBooking, final_guests: 0 }, '')).toContain(
    'Meniuri comandate: 0',
  );
  expect(
    bookingMessage({ ...plannerBooking, final_guests: 240 }, ''),
  ).toContain('Meniuri comandate: 240');
});
