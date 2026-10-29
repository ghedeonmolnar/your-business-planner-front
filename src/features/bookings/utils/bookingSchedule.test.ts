import {
  bookingScheduleInputs,
  bookingTimeChoices,
} from '@/features/bookings/utils/bookingSchedule';

test.each([
  ['18:00', '04:00', '2027-11-14'],
  ['18:00', '23:00', '2027-11-13'],
  ['18:00', '18:00', '2027-11-14'],
  ['18:00', '00:00', '2027-11-14'],
])('calculează data sfârșitului pentru %s–%s', (start, end, date) => {
  expect(
    bookingScheduleInputs(
      '2027-11-13',
      `2027-11-13 ${start}`,
      `2027-11-13 ${end}`,
    ),
  ).toEqual({ starts_at: `2027-11-13 ${start}`, ends_at: `${date} ${end}` });
});

test('schimbarea datei păstrează orele și trece corect în anul următor', () => {
  expect(
    bookingScheduleInputs('2027-12-31', '2027-11-13 18:15', '2027-11-14 04:30'),
  ).toEqual({ starts_at: '2027-12-31 18:15', ends_at: '2028-01-01 04:30' });
});

test('schimbarea datei elimină offsetul special al orei repetate și păstrează secundele', () => {
  expect(
    bookingScheduleInputs(
      '2026-11-01',
      '2026-10-25 03:30:17 +03:00',
      '2026-10-25 04:30',
    ),
  ).toEqual({ starts_at: '2026-11-01 03:30:17', ends_at: '2026-11-01 04:30' });
});

test('acceptă orice minut și indică ziua următoare pentru sfârșit', () => {
  const options = bookingTimeChoices(
    '2027-11-13',
    '04:17',
    '2027-11-13 18:00',
    true,
  );
  expect(options).toEqual([
    {
      id: '2027-11-14 04:17',
      name: '04:17 · a doua zi',
    },
  ]);
  expect(
    bookingTimeChoices('2027-11-13', '23:00', '2027-11-13 18:00', true),
  ).toEqual([{ id: '2027-11-13 23:00', name: '23:00' }]);
});

test('exclude orele inexistente și explică cele două apariții ale orei repetate', () => {
  expect(bookingTimeChoices('2026-03-29', '03:30')).toEqual([]);
  const options = bookingTimeChoices(
    '2026-10-24',
    '03:30',
    '2026-10-24 18:00',
    true,
  );
  expect(options).toEqual([
    {
      id: '2026-10-25 03:30 +03:00',
      name: '03:30 · prima apariție · a doua zi',
    },
    {
      id: '2026-10-25 03:30 +02:00',
      name: '03:30 · a doua apariție · a doua zi',
    },
  ]);
});

test.each(['24:00', '18:60', '18:xx', '1:30', ''])(
  'refuză ora invalidă %s',
  value => {
    expect(bookingTimeChoices('2027-11-13', value)).toEqual([]);
  },
);

test('sfârșitul poate rămâne în aceeași zi când ora repetată este ulterioară în UTC', () => {
  expect(
    bookingTimeChoices('2026-10-25', '03:10', '2026-10-25 03:50 +03:00', true),
  ).toEqual([{ id: '2026-10-25 03:10 +02:00', name: '03:10' }]);
});
