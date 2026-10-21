import { ApiError, type ApiErrorReason } from '@/shared/api/client';

export type ErrorContext = Record<string, string | number | boolean>;

const SUPPRESSED_REASONS: ApiErrorReason[] = ['network', 'timeout', 'aborted'];

const isExpectedError = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.reason === 'http') {
    return error.status < 500;
  }

  return SUPPRESSED_REASONS.includes(error.reason);
};

const describeError = (error: unknown) => {
  if (error instanceof ApiError) {
    return `ApiError(${error.status}): ${error.message}`;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
};

export const reportError = (error: unknown, context: ErrorContext = {}) => {
  if (isExpectedError(error)) {
    return;
  }

  console.error('[gt-events]', describeError(error), context);
};
