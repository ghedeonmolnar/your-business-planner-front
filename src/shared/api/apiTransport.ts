import {
  ABORTED_MESSAGE,
  ApiError,
  CONNECTION_FAILED_MESSAGE,
  HTTP_NO_CONTENT,
  INVALID_RESPONSE_MESSAGE,
  NO_HTTP_STATUS,
  TIMEOUT_MESSAGE,
} from '@/shared/api/apiError';
import type { ApiResponseBody } from '@/shared/api/apiError';

const REQUEST_TIMEOUT_MS = 20_000;

const readResponseBody = async (
  response: Response,
): Promise<ApiResponseBody> => {
  if (response.status === HTTP_NO_CONTENT) {
    return { kind: 'empty' };
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    await response.text().catch(() => '');

    return { kind: 'other' };
  }

  try {
    return { kind: 'json', value: await response.json() };
  } catch (error) {
    throw new ApiError(
      INVALID_RESPONSE_MESSAGE,
      response.status,
      error,
      'invalid_response',
    );
  }
};

const createRequestSignal = (
  externalSignal?: AbortSignal,
  timeoutMs = REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener('abort', abortFromCaller);
  }

  return {
    signal: controller.signal,
    hasTimedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortFromCaller);
    },
  };
};

export const isFormDataBody = (value: unknown): value is FormData =>
  typeof FormData !== 'undefined' && value instanceof FormData;

export const sendRequest = async (
  url: string,
  init: RequestInit,
  externalSignal?: AbortSignal,
  timeoutMs?: number,
) => {
  const requestSignal = createRequestSignal(externalSignal, timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: requestSignal.signal,
    });
    const body = await readResponseBody(response);

    return { response, body };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (requestSignal.hasTimedOut()) {
      throw new ApiError(TIMEOUT_MESSAGE, NO_HTTP_STATUS, error, 'timeout');
    }

    if (externalSignal?.aborted) {
      throw new ApiError(ABORTED_MESSAGE, NO_HTTP_STATUS, error, 'aborted');
    }

    throw new ApiError(
      CONNECTION_FAILED_MESSAGE,
      NO_HTTP_STATUS,
      error,
      'network',
    );
  } finally {
    requestSignal.dispose();
  }
};
