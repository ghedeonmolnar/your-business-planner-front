import { Control } from 'react-hook-form';
import {
  EventFormInput,
  EventFormValues,
} from '@/features/events/schemas/eventSchema';

export type EventFormControl = Control<
  EventFormInput,
  unknown,
  EventFormValues
>;

export type SelectOptionItem = {
  id: string;
  name: string;
};
