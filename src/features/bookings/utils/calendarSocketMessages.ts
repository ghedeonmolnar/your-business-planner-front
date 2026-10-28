import { z } from 'zod';

const messageSchema = z.object({
  event: z.string(),
  channel: z.string().optional(),
  data: z.unknown().optional(),
});

export const calendarSocketEstablishedSchema = z.object({
  socket_id: z.string().regex(/^\d+\.\d+$/),
  activity_timeout: z.number().positive().max(3600).optional(),
});

export const parseCalendarSocketMessage = (value: unknown) => {
  if (typeof value !== 'string' || value.length > 10_000)
    throw new Error('CALENDAR_SOCKET_INVALID_MESSAGE');
  const message = messageSchema.parse(JSON.parse(value));
  return {
    ...message,
    data:
      typeof message.data === 'string'
        ? (JSON.parse(message.data) as unknown)
        : message.data,
  };
};
