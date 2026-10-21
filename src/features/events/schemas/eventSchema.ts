import { z } from 'zod';
import { contactValidationMessage } from '@/shared/utils/contactLinks';
import { eventTimeRegex } from '@/features/events/utils/eventTimes';
import {
  MAX_RATE_AMOUNT,
  MAX_TOTAL_AMOUNT,
  moneyFieldSchema,
} from '@/shared/schemas/moneyFieldSchema';
import { dateToIsoDate, isValidIsoDate } from '@/shared/utils/dateInput';

const MAXIMUM_CONTACT_PHONE_LENGTH = 50;

const communicationChannels = [
  'whatsapp',
  'olx',
  'facebook',
  'instagram',
  'call',
  'tiktok',
  'email',
] as const;
const eventStatuses = [
  'partial_details',
  'confirmed',
  'completed',
  'cancelled',
] as const;
const optionalTime = z
  .string()
  .refine(
    value => value === '' || eventTimeRegex.test(value),
    'Ora trebuie să fie în intervalul 08:00 - 23:00.',
  );
const eventDate = z
  .string()
  .min(1, 'Alege data evenimentului.')
  .refine(value => value === '' || isValidIsoDate(value), {
    message: 'Completează o dată validă.',
  });
const optionalUuid = (message: string) =>
  z
    .string()
    .refine(
      value => value === '' || z.string().uuid().safeParse(value).success,
      message,
    );
const uuidArray = (message: string) => z.array(z.string().uuid(message));
export const eventSchema = z
  .object({
    communication_channel: z.union([
      z.enum(communicationChannels),
      z.literal(''),
    ]),
    contact_phone: z
      .string()
      .trim()
      .max(MAXIMUM_CONTACT_PHONE_LENGTH, 'Numărul de telefon este prea lung.'),
    legacy_contact_allowed: z.boolean(),
    mascot_ids: uuidArray('Mascota selectată nu este validă.').min(
      1,
      'Alege cel puțin o mascotă.',
    ),
    assignments: z.array(
      z.object({
        mascot_id: z.string().uuid('Mascota selectată nu este validă.'),
        employee_id: optionalUuid('Animatorul selectat nu este valid.'),
      }),
    ),
    date: eventDate,
    start_time: optionalTime,
    end_time: optionalTime,
    price_per_hour: moneyFieldSchema({
      formatMessage: 'Prețul pe oră poate avea cel mult două zecimale.',
      maximum: MAX_RATE_AMOUNT,
      maximumMessage: 'Prețul pe oră este prea mare.',
      minimum: 1,
      minimumMessage: 'Completează prețul pe oră.',
    }),
    transport_cost: moneyFieldSchema({
      formatMessage: 'Costul de transport poate avea cel mult două zecimale.',
      maximum: MAX_TOTAL_AMOUNT,
      maximumMessage: 'Costul de transport este prea mare.',
      minimum: 0,
      minimumMessage: 'Costul de transport nu poate fi negativ.',
    }),
    location: z.string().trim().max(255, 'Locația este prea lungă.'),
    address: z.string().trim().max(500, 'Adresa este prea lungă.'),
    type: z.string().trim().min(1, 'Completează tipul evenimentului.'),
    status: z.enum(eventStatuses),
  })
  .superRefine((values, context) => {
    const hasChannel = values.communication_channel !== '';
    const hasPhone = values.contact_phone !== '';

    if (!hasChannel && (!values.legacy_contact_allowed || hasPhone)) {
      context.addIssue({
        code: 'custom',
        message: 'Alege canalul de comunicare.',
        path: ['communication_channel'],
      });
    }

    if (!hasPhone && !values.legacy_contact_allowed) {
      context.addIssue({
        code: 'custom',
        message: 'Completează numărul de telefon.',
        path: ['contact_phone'],
      });
    }
    if (hasPhone) {
      const message = contactValidationMessage('call', values.contact_phone);

      if (message) {
        context.addIssue({
          code: 'custom',
          message,
          path: ['contact_phone'],
        });
      }
    }

    if (
      values.start_time &&
      values.end_time &&
      values.end_time <= values.start_time
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Ora de final trebuie să fie după ora de început.',
        path: ['end_time'],
      });
    }

    const assignmentMascotIds = values.assignments.map(
      assignment => assignment.mascot_id,
    );
    const assignmentsMatchMascots =
      assignmentMascotIds.length === values.mascot_ids.length &&
      values.mascot_ids.every(mascotId =>
        assignmentMascotIds.includes(mascotId),
      );

    if (!assignmentsMatchMascots) {
      context.addIssue({
        code: 'custom',
        message: 'Asignările nu corespund mascotelor selectate.',
        path: ['assignments'],
      });
    }

    const employeeIds = values.assignments
      .map(assignment => assignment.employee_id)
      .filter(Boolean);

    if (new Set(employeeIds).size !== employeeIds.length) {
      context.addIssue({
        code: 'custom',
        message: 'Un animator poate fi ales pentru o singură mascotă.',
        path: ['assignments'],
      });
    }

    if (values.status === 'confirmed' || values.status === 'completed') {
      const requiredFields = [
        ['location', values.location, 'Completează locația.'],
        ['address', values.address, 'Completează adresa completă.'],
        ['start_time', values.start_time, 'Alege ora de început.'],
        ['end_time', values.end_time, 'Alege ora de final.'],
      ] as const;

      requiredFields.forEach(([path, value, message]) => {
        if (!value) {
          context.addIssue({ code: 'custom', message, path: [path] });
        }
      });

      values.assignments.forEach((assignment, index) => {
        if (!assignment.employee_id) {
          context.addIssue({
            code: 'custom',
            message: 'Alege animatorul pentru această mascotă.',
            path: ['assignments', index, 'employee_id'],
          });
        }
      });
    }
  });

export const createEventSchema = eventSchema.refine(
  values =>
    !isValidIsoDate(values.date) || values.date >= dateToIsoDate(new Date()),
  {
    message: 'Data evenimentului nu poate fi în trecut.',
    path: ['date'],
  },
);

export type EventFormInput = z.input<typeof eventSchema>;
export type EventFormValues = z.output<typeof eventSchema>;

export const emptyEventForm: EventFormInput = {
  communication_channel: '',
  contact_phone: '',
  legacy_contact_allowed: false,
  mascot_ids: [],
  assignments: [],
  date: '',
  start_time: '',
  end_time: '',
  price_per_hour: 0,
  transport_cost: 0,
  location: '',
  address: '',
  type: '',
  status: 'confirmed',
};
