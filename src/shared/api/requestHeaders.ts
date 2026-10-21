import {
  ApiError,
  HTTP_UNAUTHORIZED,
  SESSION_EXPIRED_MESSAGE,
} from '@/shared/api/apiError';
import { getAuthToken } from '@/shared/storage/authTokenStorage';

export const buildRequestHeaders = async (
  auth: boolean,
  hasJsonBody: boolean,
) => {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = await getAuthToken();
    if (!token) {
      throw new ApiError(SESSION_EXPIRED_MESSAGE, HTTP_UNAUTHORIZED);
    }
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
