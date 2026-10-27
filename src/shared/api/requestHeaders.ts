import {
  ApiError,
  HTTP_UNAUTHORIZED,
  SESSION_EXPIRED_MESSAGE,
} from '@/shared/api/apiError';
import { getAuthToken } from '@/shared/storage/authTokenStorage';
import { createOperationId } from '@/shared/utils/createOperationId';
import { Platform } from 'react-native';
import { appBuild } from '@/shared/config/appBuild';

export const buildRequestHeaders = async (
  auth: boolean,
  hasJsonBody: boolean,
) => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Request-ID': createOperationId(),
    'X-App-Build': String(appBuild),
    'X-App-Platform': Platform.OS,
  };
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
