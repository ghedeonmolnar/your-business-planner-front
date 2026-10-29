import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';

export const authorizeCalendarRealtimeApi = (
  socketId: string,
  channelName: string,
  signal: AbortSignal,
) =>
  apiRequest('/calendar/realtime/auth', {
    method: 'POST',
    body: { socket_id: socketId, channel_name: channelName },
    signal,
    schema: z.object({ auth: z.string().regex(/^[^:]+:[a-f0-9]{64}$/) }),
  });
