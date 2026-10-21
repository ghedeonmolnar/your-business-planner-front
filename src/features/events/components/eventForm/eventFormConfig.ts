import { FieldPath } from 'react-hook-form';
import {
  emptyEventForm,
  EventFormInput,
} from '@/features/events/schemas/eventSchema';
import { Event } from '@/features/events/types';
import { CommunicationChannel } from '@/shared/types/contact';
import { eventContactPhone } from '@/shared/utils/contactLinks';

export type EventFormStep = 1 | 2 | 3;

const eventStatuses: EventFormInput['status'][] = [
  'partial_details',
  'confirmed',
  'completed',
  'cancelled',
];

export const fallbackChannels = [
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'olx', name: 'OLX' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Insta' },
  { id: 'call', name: 'Apel' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'email', name: 'Email' },
] satisfies { id: CommunicationChannel; name: string }[];

export const stepFields: Record<1 | 2, FieldPath<EventFormInput>[]> = {
  1: ['communication_channel', 'contact_phone', 'date', 'mascot_ids', 'type'],
  2: [
    'status',
    'location',
    'address',
    'start_time',
    'end_time',
    'price_per_hour',
    'transport_cost',
  ],
};

export const MIN_CONTACT_LENGTH = 6;

const MAXIMUM_EVENT_YEARS_AHEAD = 2;

const assignmentIds = (
  ids?: string[] | null,
  fallbackId?: string | null,
): string[] => {
  if (ids?.length) {
    return ids;
  }

  return fallbackId ? [fallbackId] : [];
};

const toFormTime = (time?: string | null) => (time ? time.slice(0, 5) : '');

export const toEventFormValues = (
  event?: Event | null,
  initialValues?: Partial<EventFormInput> | null,
): EventFormInput => {
  if (!event) {
    return {
      ...emptyEventForm,
      ...initialValues,
      start_time: toFormTime(initialValues?.start_time),
      end_time: toFormTime(initialValues?.end_time),
    };
  }

  const mascotIds = assignmentIds(
    event.mascot_ids,
    event.mascot_id ?? event.mascot?.id,
  );
  const employeeIds = assignmentIds(event.employee_ids, event.employee_id);
  const assignments = event.assignments?.length
    ? event.assignments.map(assignment => ({
        mascot_id: assignment.mascot_id,
        employee_id: assignment.employee_id ?? '',
      }))
    : mascotIds.map((mascotId, index) => ({
        mascot_id: mascotId,
        employee_id: employeeIds[index] ?? '',
      }));

  return {
    communication_channel: event.communication_channel ?? '',
    contact_phone: eventContactPhone(event) ?? '',
    legacy_contact_allowed: !eventContactPhone(event),
    mascot_ids: mascotIds,
    assignments,
    date: event.date,
    start_time: toFormTime(event.start_time),
    end_time: toFormTime(event.end_time),
    price_per_hour: Number(event.price_per_hour) || 0,
    transport_cost: Number(event.transport_cost) || 0,
    location: event.location ?? '',
    address: event.address ?? '',
    type: event.type,
    status: eventStatuses.includes(event.status as EventFormInput['status'])
      ? (event.status as EventFormInput['status'])
      : 'confirmed',
  };
};

export const eventDateBounds = (event?: Event | null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = event ? new Date(`${event.date}T00:00:00`) : null;
  const minimumDate =
    eventDate && !Number.isNaN(eventDate.getTime()) && eventDate < today
      ? eventDate
      : today;
  const maximumDate = new Date(today);
  maximumDate.setFullYear(
    maximumDate.getFullYear() + MAXIMUM_EVENT_YEARS_AHEAD,
  );

  return { maximumDate, minimumDate };
};
