import { showMessage } from '@/shared/feedback/showMessage';
import { ErrorContext, reportError } from '@/shared/monitoring/reportError';
import { getErrorMessage } from '@/shared/utils/errorMessage';

export const showError = (
  error: unknown,
  fallback: string,
  context: ErrorContext = {},
) => {
  reportError(error, context);
  showMessage('Eroare', getErrorMessage(error, fallback));
};
