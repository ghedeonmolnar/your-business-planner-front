import { MessageOptions, showMessage } from '@/shared/feedback/showMessage';
import { ErrorContext, reportError } from '@/shared/monitoring/reportError';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { ApiError } from '@/shared/api/apiError';

export const showError = (
  error: unknown,
  fallback: string,
  context: ErrorContext = {},
  options: MessageOptions & { title?: string } = {},
) => {
  if (error instanceof ApiError && error.reason === 'aborted') return;
  reportError(error, context);
  const { title = 'Eroare', ...messageOptions } = options;
  showMessage(title, getErrorMessage(error, fallback), messageOptions);
};
