import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { refreshPlannerCalendar } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

test('refresh reîncarcă ziua, perioada și comparația, cu retry după eșec parțial', async () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
    },
  });
  const keys = [
    queryKeys.planner.calendar('company-1', {
      date_from: '2027-01-01',
      date_to: '2027-12-31',
    }),
    queryKeys.planner.calendar('company-1', {
      date_from: '2026-12-01',
      date_to: '2026-12-31',
    }),
    queryKeys.planner.directory('company-1', 'hall-day', {
      date: '2027-01-01',
    }),
    queryKeys.planner.booking('company-1', 'event-1'),
  ];
  let failDay = false;
  const queries = keys.map((key, index) => {
    const queryFn = jest.fn(async () => {
      if (index === 2 && failDay) throw new Error('Zi indisponibilă');
      return { value: index };
    });
    const observer = new QueryObserver(client, { queryKey: key, queryFn });
    const unsubscribe = observer.subscribe(() => undefined);
    return { key, queryFn, unsubscribe };
  });
  try {
    await Promise.all(
      queries.map(query =>
        client.ensureQueryData({ queryKey: query.key, queryFn: query.queryFn }),
      ),
    );
    failDay = true;
    await refreshPlannerCalendar(client, 'company-1');
    expect(queries.map(query => query.queryFn.mock.calls.length)).toEqual([
      2, 2, 2, 1,
    ]);
    expect(client.getQueryState(keys[2])?.status).toBe('error');
    failDay = false;
    await refreshPlannerCalendar(client, 'company-1');
    expect(client.getQueryState(keys[2])?.status).toBe('success');
  } finally {
    queries.forEach(query => query.unsubscribe());
    client.clear();
  }
});
