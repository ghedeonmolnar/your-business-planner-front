import {
  ABORTED_MESSAGE,
  ApiError,
  NO_HTTP_STATUS,
} from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export const assertCurrentRequestSession = (generation: number) => {
  if (generation !== getSessionGeneration()) {
    throw new ApiError(ABORTED_MESSAGE, NO_HTTP_STATUS, undefined, 'aborted');
  }
};
