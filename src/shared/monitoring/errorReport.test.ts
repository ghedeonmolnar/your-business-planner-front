import { ApiError } from '@/shared/api/apiError';
import { describeErrorReport } from '@/shared/monitoring/errorReport';
import {
  configureErrorCollector,
  reportError,
} from '@/shared/monitoring/reportError';

test('nu trimite mesaje, URL-uri, payloaduri sau contexte arbitrare in colector', async () => {
  const privateValue = 'PRIVATE_SENTINEL_0712345678';
  const id = '10000000-0000-4000-8000-000000000001';
  const error = new ApiError(
    privateValue,
    500,
    { token: privateValue },
    'http',
    id,
  );
  expect(
    JSON.stringify(describeErrorReport(error, privateValue)),
  ).not.toContain(privateValue);
  const collector = jest.fn(async () => undefined);
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  configureErrorCollector(collector);
  try {
    reportError(error, {
      source: 'server-state',
      body: privateValue,
      url: privateValue,
    });
    reportError(new ApiError(privateValue, 409));
    expect(collector).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(collector.mock.calls)).not.toContain(privateValue);
    expect(JSON.stringify(log.mock.calls)).not.toContain(privateValue);
    expect(collector).toHaveBeenCalledWith(
      expect.objectContaining({ request_id: id }),
      expect.any(Number),
    );
  } finally {
    configureErrorCollector(undefined);
    log.mockRestore();
  }
});

test('semnaleaza esecul colectorului fara mesajul sau datele private ale exceptiei', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const warning = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined);
  configureErrorCollector(async () => {
    throw new Error('PRIVATE_COLLECTOR_SENTINEL');
  });
  try {
    reportError(new Error('PRIVATE_APPLICATION_SENTINEL'));
    await Promise.resolve();
    expect(warning).toHaveBeenCalledWith('[your-business-planner]', {
      category: 'collector_unavailable',
    });
    expect(JSON.stringify(warning.mock.calls)).not.toContain('PRIVATE_');
  } finally {
    configureErrorCollector(undefined);
    log.mockRestore();
    warning.mockRestore();
  }
});
