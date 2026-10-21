import {
  createEventSchema,
  emptyEventForm,
  eventSchema,
} from '@/features/events/schemas/eventSchema';
import { dateToIsoDate } from '@/shared/utils/dateInput';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 1);

const validEventForm = {
  ...emptyEventForm,
  communication_channel: 'whatsapp' as const,
  contact_phone: '0732652339',
  mascot_ids: ['11111111-1111-4111-8111-111111111111'],
  assignments: [
    {
      mascot_id: '11111111-1111-4111-8111-111111111111',
      employee_id: '',
    },
  ],
  date: dateToIsoDate(futureDate),
  start_time: '15:23',
  end_time: '16:45',
  price_per_hour: '250.50',
  location: 'Oradea',
  type: 'aniversare',
  status: 'partial_details' as const,
};

test('new events default to a confirmed booking', () => {
  expect(emptyEventForm.status).toBe('confirmed');
});

test('transport cost defaults to zero, accepts decimals and rejects negatives', () => {
  expect(emptyEventForm.transport_cost).toBe(0);
  expect(
    eventSchema.parse({ ...validEventForm, transport_cost: '' }).transport_cost,
  ).toBe(0);
  expect(
    eventSchema.parse({ ...validEventForm, transport_cost: '100.50' })
      .transport_cost,
  ).toBe(100.5);

  const negative = eventSchema.safeParse({
    ...validEventForm,
    transport_cost: '-10',
  });

  expect(negative.success).toBe(false);
  expect(negative.error?.issues[0]).toMatchObject({
    path: ['transport_cost'],
    message: 'Costul de transport nu poate fi negativ.',
  });
});

test('event schema accepts explicit custom minute times and decimal numbers', () => {
  const result = eventSchema.parse(validEventForm);

  expect(result.start_time).toBe('15:23');
  expect(result.price_per_hour).toBe(250.5);
});

test('partial details accepts missing schedule and animator', () => {
  const result = eventSchema.safeParse({
    ...validEventForm,
    start_time: '',
    end_time: '',
    location: '',
    address: '',
  });

  expect(result.success).toBe(true);
});

test('confirmed event requires complete schedule and animator', () => {
  const result = eventSchema.safeParse({
    ...validEventForm,
    status: 'confirmed',
    address: '',
  });

  expect(result.success).toBe(false);
});

test('event schema rejects compact time values', () => {
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      start_time: '1523',
    }).success,
  ).toBe(false);
});

test('event schema rejects comma decimal numbers', () => {
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      price_per_hour: '250,50',
    }).success,
  ).toBe(false);
});

test('creation rejects past dates while editing keeps them valid', () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);

  expect(
    createEventSchema.safeParse({
      ...validEventForm,
      date: dateToIsoDate(pastDate),
    }).success,
  ).toBe(false);
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      date: dateToIsoDate(pastDate),
    }).success,
  ).toBe(true);
});

test('money fields reject more than two decimals', () => {
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      price_per_hour: '12.345',
    }).success,
  ).toBe(false);
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      transport_cost: '1e3',
    }).success,
  ).toBe(false);
});

test.each(['olx', 'facebook', 'instagram', 'email', 'tiktok'])(
  '%s is informational and accepts a separate phone without a profile',
  channel => {
    const result = eventSchema.safeParse({
      ...validEventForm,
      communication_channel: channel,
    });

    expect(result.success).toBe(true);
  },
);

test.each(['call', 'whatsapp', 'olx', 'facebook', 'instagram'])(
  '%s requires a valid contact phone for a new event',
  channel => {
    expect(
      eventSchema.safeParse({
        ...validEventForm,
        communication_channel: channel,
        contact_phone: '',
      }).success,
    ).toBe(false);
    expect(
      eventSchema.safeParse({
        ...validEventForm,
        communication_channel: channel,
        contact_phone: '0732',
      }).success,
    ).toBe(false);
  },
);

test('legacy events without a phone can still be edited', () => {
  expect(
    eventSchema.safeParse({
      ...validEventForm,
      communication_channel: 'facebook',
      contact_phone: '',
      legacy_contact_allowed: true,
    }).success,
  ).toBe(true);
});
