import { Event } from '@/features/events/types';
import { buildEventReservationMessage } from '@/features/events/utils/eventReservationMessage';
import { eventFixture } from '@/shared/test/apiFixtures';

const reservation: Event = {
  ...eventFixture,
  date: '2026-10-11',
  start_time: '15:00',
  end_time: '17:00',
  price_per_hour: 200,
  transport_cost: 100,
  total_amount: 500,
  address: 'Club art',
  location: 'Băile Felix',
  mascot_ids: ['mascot-1', 'mascot-2'],
  mascots: [
    { ...eventFixture.mascots![0], name: 'Mickey' },
    { ...eventFixture.mascots![0], id: 'mascot-2', name: 'Minnie Mouse' },
  ],
};

test('compune detaliile rezervării cu diacritice și totalul salvat de API', () => {
  expect(buildEventReservationMessage(reservation, new Map())).toBe(
    'Detaliile rezervării:\n' +
      'Data: 11 octombrie\n' +
      'Interval orar: 15-17\n' +
      'Personaje: Mickey & Minnie Mouse\n' +
      'Locație: Club art, Băile Felix\n' +
      'Preț: 500 de lei',
  );
});

test('păstrează minutele și zecimalele prețului total, fără recalculare', () => {
  const message = buildEventReservationMessage(
    {
      ...reservation,
      start_time: '15:30:00',
      end_time: '17:00:00',
      total_amount: 475.5,
    },
    new Map(),
  );

  expect(message).toContain('Interval orar: 15:30-17');
  expect(message).toContain('Preț: 475,5 lei');
});

test('rezolvă personajele din catalog când răspunsul are doar ID-uri', () => {
  const message = buildEventReservationMessage(
    { ...reservation, mascots: undefined },
    new Map([
      ['mascot-1', 'Mickey'],
      ['mascot-2', 'Minnie Mouse'],
    ]),
  );

  expect(message).toContain('Personaje: Mickey & Minnie Mouse');
});

test('marchează detaliile lipsă fără să inventeze intervalul sau prețul', () => {
  const message = buildEventReservationMessage(
    {
      ...reservation,
      status: 'partial_details',
      start_time: null,
      end_time: null,
      address: null,
      location: null,
      mascots: [],
      mascot_ids: [],
      mascot_id: null,
      total_amount: 0,
    },
    new Map(),
  );

  expect(message).toContain('Interval orar: De confirmat');
  expect(message).toContain('Personaje: De confirmat');
  expect(message).toContain('Locație: De confirmat');
  expect(message).toContain('Preț: De confirmat');
});

test('afișează localitatea singură și nu presupune un total absent', () => {
  const message = buildEventReservationMessage(
    { ...reservation, address: null, total_amount: undefined },
    new Map(),
  );

  expect(message).toContain('Locație: Băile Felix');
  expect(message).toContain('Preț: De confirmat');
});
