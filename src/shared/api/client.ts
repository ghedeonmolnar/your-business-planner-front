import { API_URL } from '@env';
import { z } from 'zod';
import {
  clearAuthToken,
  getAuthToken,
} from '@/shared/storage/authTokenStorage';
import {
  ApiError,
  responseErrorCode,
  errorMessageForResponse,
  HTTP_OK,
  HTTP_UNAUTHORIZED,
  INVALID_RESPONSE_MESSAGE,
  MISSING_API_URL_MESSAGE,
  NO_HTTP_STATUS,
  SESSION_EXPIRED_MESSAGE,
} from '@/shared/api/apiError';
import { isFormDataBody, sendRequest } from '@/shared/api/apiTransport';
import { notifyCompanyAccessInactive } from '@/shared/api/sessionExpiry';

export { ApiError } from '@/shared/api/apiError';
export type { ApiErrorReason } from '@/shared/api/apiError';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type ApiRequestOptions<T> = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  schema?: z.ZodType<T>;
};

export type ApiPageOptions<T> = {
  signal?: AbortSignal;
  itemSchema?: z.ZodType<T>;
};

export type ApiPage<T> = {
  items: T[];
  page: number;
  lastPage: number;
  total: number;
};

export const DEFAULT_PAGE_SIZE = 20;
const ALL_PAGES_PAGE_SIZE = 100;

const apiBaseUrl = typeof API_URL === 'string' ? API_URL : '';

const pageMetaSchema = z.object({
  current_page: z.number().int().positive().optional(),
  last_page: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
});

const pageResponseSchema = z.union([
  z.array(z.unknown()),
  z.object({
    data: z.array(z.unknown()),
    meta: pageMetaSchema.optional(),
  }),
]);

const parseWithSchema = <T>(
  schema: z.ZodType<T>,
  value: unknown,
  status: number,
): T => {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(
      INVALID_RESPONSE_MESSAGE,
      status,
      result.error,
      'invalid_response',
    );
  }

  return result.data;
};

const buildHeaders = async (auth: boolean, hasJsonBody: boolean) => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
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

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions<T> = {},
): Promise<T> => {
  if (!apiBaseUrl) {
    throw new ApiError(
      MISSING_API_URL_MESSAGE,
      NO_HTTP_STATUS,
      undefined,
      'configuration',
    );
  }

  const { method = 'GET', body, auth = true, signal, schema } = options;
  const isMultipart = isFormDataBody(body);
  const hasJsonBody = body !== undefined && !isMultipart;
  const headers = await buildHeaders(auth, hasJsonBody);
  const { response, body: responseBody } = await sendRequest(
    `${apiBaseUrl}${path}`,
    {
      method,
      headers,
      body: isMultipart ? body : hasJsonBody ? JSON.stringify(body) : undefined,
    },
    signal,
  );

  if (!response.ok) {
    if (responseErrorCode(responseBody) === 'SUBSCRIPTION_INACTIVE') {
      notifyCompanyAccessInactive();
    }
    let tokenCleanupError: unknown;

    if (response.status === HTTP_UNAUTHORIZED) {
      try {
        await clearAuthToken();
      } catch (error) {
        tokenCleanupError = error;
      }
    }

    throw new ApiError(
      errorMessageForResponse(response.status, responseBody),
      response.status,
      {
        response: responseBody.kind === 'json' ? responseBody.value : undefined,
        tokenCleanupError,
      },
    );
  }

  if (responseBody.kind === 'other') {
    throw new ApiError(
      INVALID_RESPONSE_MESSAGE,
      response.status,
      undefined,
      'invalid_response',
    );
  }

  const payload = responseBody.kind === 'json' ? responseBody.value : null;

  return schema
    ? parseWithSchema(schema, payload, response.status)
    : (payload as T);
};

const withPaginationParams = (path: string, page: number, perPage: number) => {
  const separator = path.includes('?') ? '&' : '?';

  return `${path}${separator}page=${page}&per_page=${perPage}`;
};

const parseItems = <T>(
  items: unknown[],
  itemSchema: z.ZodType<T> | undefined,
): T[] =>
  itemSchema
    ? parseWithSchema(z.array(itemSchema), items, HTTP_OK)
    : (items as T[]);

export const apiPageRequest = async <T>(
  path: string,
  page = 1,
  perPage = DEFAULT_PAGE_SIZE,
  options: ApiPageOptions<T> = {},
): Promise<ApiPage<T>> => {
  const response = await apiRequest(withPaginationParams(path, page, perPage), {
    signal: options.signal,
    schema: pageResponseSchema,
  });

  if (Array.isArray(response)) {
    const items = parseItems(response, options.itemSchema);

    return { items, page: 1, lastPage: 1, total: items.length };
  }

  const currentPage = response.meta?.current_page ?? page;
  const items = parseItems(response.data, options.itemSchema);

  return {
    items,
    page: currentPage,
    lastPage: response.meta?.last_page ?? currentPage,
    total: response.meta?.total ?? items.length,
  };
};

export const apiPaginatedRequest = async <T>(
  path: string,
  options: ApiPageOptions<T> = {},
): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;

  for (;;) {
    const response = await apiPageRequest<T>(
      path,
      page,
      ALL_PAGES_PAGE_SIZE,
      options,
    );

    items.push(...response.items);

    if (response.page >= response.lastPage) {
      return items;
    }

    page = response.page + 1;
  }
};

export const isUnauthorizedError = (error: unknown): error is ApiError =>
  error instanceof ApiError && error.status === HTTP_UNAUTHORIZED;
