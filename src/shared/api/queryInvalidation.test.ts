import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  invalidateEventDocuments,
  invalidateEventFinancials,
} from '@/shared/api/queryInvalidation';

test('payment changes refresh earnings and client history without invalidating catalog lists', () => {
  const client = new QueryClient();
  const affected = [
    queryKeys.events.detail('event-1'),
    queryKeys.events.list({}),
    queryKeys.events.upcoming,
    queryKeys.events.payments('event-1'),
    queryKeys.events.reminderWindow('2026-10-14', '2026-11-13'),
    queryKeys.clients.events('client-1', 'all'),
    queryKeys.employees.detail('employee-1'),
    queryKeys.mascots.detail('mascot-1'),
    queryKeys.analytics.report(2026),
  ];
  const unaffected = [
    queryKeys.clients.all,
    queryKeys.employees.all,
    queryKeys.mascots.all,
    queryKeys.events.payments('event-2'),
    queryKeys.events.documents('event-1'),
    queryKeys.events.availability({ date: '2026-10-14' }),
  ];
  [...affected, ...unaffected].forEach(key =>
    client.setQueryData(key, { value: 1 }),
  );

  invalidateEventFinancials(client, 'event-1');

  affected.forEach(key =>
    expect(client.getQueryState(key)?.isInvalidated).toBe(true),
  );
  unaffected.forEach(key =>
    expect(client.getQueryState(key)?.isInvalidated).toBe(false),
  );
  client.clear();
});

test('document changes refresh only the document list for their event', () => {
  const client = new QueryClient();
  const documents = queryKeys.events.documents('event-1');
  const unaffected = [
    queryKeys.events.documents('event-2'),
    queryKeys.events.detail('event-1'),
    queryKeys.events.payments('event-1'),
    queryKeys.analytics.report(2026),
  ];
  [documents, ...unaffected].forEach(key =>
    client.setQueryData(key, { value: 1 }),
  );

  invalidateEventDocuments(client, 'event-1');

  expect(client.getQueryState(documents)?.isInvalidated).toBe(true);
  unaffected.forEach(key =>
    expect(client.getQueryState(key)?.isInvalidated).toBe(false),
  );
  client.clear();
});
