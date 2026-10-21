import { ApiError } from '@/shared/api/apiError';
import { reportError } from '@/shared/monitoring/reportError';

const logError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

afterEach(() => logError.mockClear());
afterAll(() => logError.mockRestore());

test.each(['configuration', 'invalid_response'] as const)(
  'reports unexpected API failures with reason %s',
  reason => {
    reportError(new ApiError('Unexpected contract', 200, undefined, reason));
    expect(logError).toHaveBeenCalledTimes(1);
  },
);

test.each(['network', 'timeout', 'aborted'] as const)(
  'suppresses expected failures with reason %s',
  reason => {
    reportError(new ApiError('Expected failure', 0, undefined, reason));
    expect(logError).not.toHaveBeenCalled();
  },
);

test('reports server failures and suppresses validation failures', () => {
  reportError(new ApiError('Server failure', 500));
  reportError(new ApiError('Validation failure', 422));
  expect(logError).toHaveBeenCalledTimes(1);
});
