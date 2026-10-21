import { EventFormValues } from '@/features/events/schemas/eventSchema';
import { toEventPayload } from '@/features/events/utils/eventPayload';

const values: EventFormValues = {
  communication_channel: 'facebook',
  contact_phone: ' 0732 652 339 ',
  legacy_contact_allowed: false,
  mascot_ids: ['11111111-1111-4111-8111-111111111111'],
  assignments: [
    {
      mascot_id: '11111111-1111-4111-8111-111111111111',
      employee_id: '',
    },
  ],
  date: '2026-09-20',
  start_time: '12:00',
  end_time: '14:00',
  price_per_hour: 250,
  transport_cost: 100,
  location: 'Oradea',
  address: '  Strada Republicii 12  ',
  type: 'aniversare',
  status: 'partial_details',
};

test('event payload sends the informational channel and separate contact phone', () => {
  const payload = toEventPayload(values);

  expect(payload.communication_channel).toBe('facebook');
  expect(payload.contact_phone).toBe('0732 652 339');
  expect(payload).not.toHaveProperty('contact_value');
  expect(payload.address).toBe('Strada Republicii 12');
  expect(payload.assignments[0].employee_id).toBeNull();
});

test('event payload sends the transport cost for the backend total', () => {
  expect(toEventPayload(values).transport_cost).toBe(100);
});

test('event payload omits the contact block when no channel is selected', () => {
  const payload = toEventPayload({ ...values, communication_channel: '' });

  expect(payload).not.toHaveProperty('communication_channel');
  expect(payload).not.toHaveProperty('contact_phone');
});
