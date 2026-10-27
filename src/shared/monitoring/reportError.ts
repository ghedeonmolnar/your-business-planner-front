import { ApiError, type ApiErrorReason } from '@/shared/api/apiError';
import {
  describeErrorReport,
  ErrorReport,
} from '@/shared/monitoring/errorReport';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

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

let collector:
  ((report: ErrorReport, generation: number) => Promise<unknown>) | undefined;

export const configureErrorCollector = (send: typeof collector) => {
  collector = send;
};

export const reportError = (error: unknown, context: ErrorContext = {}) => {
  if (isExpectedError(error)) {
    return;
  }

  const report = describeErrorReport(error, context.source);
  console.error('[your-business-planner]', report);
  void collector?.(report, getSessionGeneration()).catch(() => {
    console.warn('[your-business-planner]', {
      category: 'collector_unavailable',
    });
  });
};
