import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { bookingSchema } from '@/features/bookings/schemas/bookingApiSchemas';

export const getBookingRemindersApi = (signal?: AbortSignal) =>
  apiRequest('/reminder-events', { signal, schema: z.array(bookingSchema) });
