import { apiRequest } from '@/shared/api/client';
import { ErrorReport } from '@/shared/monitoring/errorReport';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';

export const sendErrorReportApi = async (
  report: ErrorReport,
  generation: number,
) => {
  assertCurrentRequestSession(generation);
  return apiRequest('/telemetry/errors', { method: 'POST', body: report });
};
