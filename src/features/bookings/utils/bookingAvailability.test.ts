import {
  bookingAvailabilityRange,
  bookingAvailabilityWindow,
} from '@/features/bookings/utils/bookingAvailability';

test('ferestrele de șase luni traversează anul bisect și se extind fără suprapunere', () => {
  const first = bookingAvailabilityRange('2027-11', []);
  expect(first).toEqual({ from: '2027-11-01', to: '2028-04-30' });
  expect(bookingAvailabilityRange('2028-02', [first])).toEqual(first);
  expect(bookingAvailabilityRange('2028-05', [first])).toEqual({
    from: '2028-05-01',
    to: '2028-10-31',
  });
  expect(bookingAvailabilityRange('2027-10', [first])).toEqual({
    from: '2027-05-01',
    to: '2027-10-31',
  });
});

test('un răspuns incomplet nu poate transforma zilele necunoscute în zile libere', () => {
  expect(() =>
    bookingAvailabilityWindow(
      { revision: 'a'.repeat(64), halls: [], days: [] },
      {
        owner: 'owner',
        hallId: 'hall-1',
        from: '2027-11-01',
        to: '2028-04-30',
      },
    ),
  ).toThrow('CALENDAR_AVAILABILITY_INCOMPLETE');
});
