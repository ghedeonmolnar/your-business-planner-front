import { EventFormValues } from '@/features/events/schemas/eventSchema';
import { EventPayload } from '@/features/events/types';

const optionalText = (value: string) => value.trim() || null;

export const toEventPayload = (values: EventFormValues): EventPayload => ({
  ...(values.communication_channel
    ? {
        communication_channel: values.communication_channel,
        contact_phone: optionalText(values.contact_phone),
      }
    : {}),
  date: values.date,
  start_time: optionalText(values.start_time),
  end_time: optionalText(values.end_time),
  price_per_hour: values.price_per_hour,
  transport_cost: values.transport_cost,
  location: optionalText(values.location),
  address: optionalText(values.address),
  type: values.type,
  status: values.status,
  assignments: values.assignments.map(assignment => ({
    mascot_id: assignment.mascot_id,
    employee_id: assignment.employee_id || null,
  })),
});
