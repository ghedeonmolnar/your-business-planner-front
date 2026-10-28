import { formatCompanyTimeRange } from '@/shared/utils/formatDate';

test('programul folosește ora României și marchează trecerea în ziua următoare', () => {
  expect(
    formatCompanyTimeRange('2026-10-24T15:00:00Z', '2026-10-24T20:00:00Z'),
  ).toBe('18:00 – 23:00');
  expect(
    formatCompanyTimeRange('2026-10-24T15:00:00Z', '2026-10-25T02:00:00Z'),
  ).toBe('18:00 – 04:00 (+1 zi)');
  expect(
    formatCompanyTimeRange(
      '2026-10-24T15:00:00Z',
      '2026-10-25T02:00:00Z',
      false,
    ),
  ).toBe('18:00 – 04:00');
  expect(formatCompanyTimeRange(null, null)).toBeNull();
  expect(formatCompanyTimeRange('invalid', '2026-10-25T02:00:00Z')).toBeNull();
});
