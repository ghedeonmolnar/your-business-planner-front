import { deleteClientApi } from '@/features/clients/api/clientsApi';
import {
  deleteEmployeeApi,
  forceDeleteEmployeeApi,
} from '@/features/employees/api/employeesApi';
import {
  deleteEventApi,
  deleteEventDocumentApi,
  deleteEventPaymentApi,
} from '@/features/events/api/eventsApi';
import {
  deleteMascotApi,
  forceDeleteMascotApi,
} from '@/features/mascots/api/mascotsApi';
import { jsonResponse } from '@/shared/test/apiFixtures';
import { getAuthToken } from '@/shared/storage/authTokenStorage';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  getAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

const actions = [
  ['client', deleteClientApi, 'deleted'],
  [
    'employee',
    (id: string) => deleteEmployeeApi({ id, version: 1 }),
    'archived',
  ],
  [
    'employee permanently',
    (id: string) => forceDeleteEmployeeApi({ id, version: 1 }),
    'deleted',
  ],
  ['event', deleteEventApi, 'deleted'],
  ['payment', deleteEventPaymentApi, 'deleted'],
  ['document', deleteEventDocumentApi, 'deleted'],
  ['mascot', deleteMascotApi, 'archived'],
  ['mascot permanently', forceDeleteMascotApi, 'deleted'],
] as const;

beforeEach(() => {
  jest.mocked(getAuthToken).mockResolvedValue('test-token');
  globalThis.fetch = jest.fn();
});

afterEach(() => jest.resetAllMocks());

test.each(actions)(
  'accepts the status response for %s',
  async (_name, action, status) => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(200, { status }));
    await expect(action('resource-id')).resolves.toEqual({ status });
  },
);

test.each(actions)(
  'accepts legacy success responses for %s during API rollout',
  async (_name, action) => {
    const response = { message: 'Legacy server success' };
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(200, response));
    await expect(action('resource-id')).resolves.toEqual(response);
  },
);

test.each(actions)(
  'reads the status for %s when the API includes legacy compatibility text',
  async (_name, action, status) => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(
        jsonResponse(200, { status, message: 'Legacy compatibility' }),
      );
    await expect(action('resource-id')).resolves.toEqual({ status });
  },
);

test.each(actions)(
  'rejects an invalid success response for %s',
  async (_name, action) => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(jsonResponse(200, { status: 'unknown' }));
    await expect(action('resource-id')).rejects.toMatchObject({
      reason: 'invalid_response',
    });
  },
);
