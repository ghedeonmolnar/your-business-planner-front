import { ApiError } from '@/shared/api/apiError';

export type ErrorReport = {
  category: 'server' | 'invalid_response' | 'configuration' | 'application';
  source: 'server-state' | 'render' | 'application';
  status?: number;
  request_id?: string;
};

export const describeErrorReport = (
  error: unknown,
  source: unknown,
): ErrorReport => ({
  category:
    error instanceof ApiError
      ? error.reason === 'invalid_response'
        ? 'invalid_response'
        : error.reason === 'configuration'
          ? 'configuration'
          : 'server'
      : 'application',
  source:
    source === 'server-state'
      ? source
      : source === 'render'
        ? source
        : 'application',
  status: error instanceof ApiError ? error.status : undefined,
  request_id: error instanceof ApiError ? error.requestId : undefined,
});
