import { hasEventEnded } from '@/features/events/utils/eventCompletion';

const now = new Date('2026-09-20T13:00:00').getTime();

describe('hasEventEnded', () => {
  it('considera incheiate evenimentele a caror ora de final a trecut', () => {
    expect(
      hasEventEnded({ date: '2026-09-20', end_time: '12:00' }, now),
    ).toBe(true);
    expect(
      hasEventEnded({ date: '2026-09-20', end_time: '14:00' }, now),
    ).toBe(false);
  });

  it('tine cont de zi inaintea orei', () => {
    expect(
      hasEventEnded({ date: '2026-09-19', end_time: '23:00' }, now),
    ).toBe(true);
    expect(
      hasEventEnded({ date: '2026-09-21', end_time: '09:00' }, now),
    ).toBe(false);
  });

  it('păstrează în desfășurare evenimentele fără ora de final până trece ziua', () => {
    expect(hasEventEnded({ date: '2026-09-20', end_time: null }, now)).toBe(
      false,
    );
    expect(hasEventEnded({ date: '2026-09-19', end_time: null }, now)).toBe(
      true,
    );
  });
});
