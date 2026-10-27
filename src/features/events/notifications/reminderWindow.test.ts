import { reminderWindow } from '@/features/events/notifications/reminderWindow';

test('păstrează numai primele 40 cronologic și numără restul fără să modifice intrarea', () => {
  const planned = Array.from({ length: 43 }, (_, index) => ({
    id: String(index),
    timestamp: 100 - index,
    title: '',
    body: '',
    eventId: 'event',
  }));
  const result = reminderWindow(planned);
  expect(result.selected).toHaveLength(40);
  expect(result.deferred).toBe(3);
  expect(result.selected[0].timestamp).toBe(58);
  expect(result.selected[39].timestamp).toBe(97);
  expect(planned[0].timestamp).toBe(100);
});
