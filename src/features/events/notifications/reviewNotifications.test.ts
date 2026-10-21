import notifee from '@notifee/react-native';
import { displayReviewNotification } from '@/features/events/notifications/reviewNotifications';

beforeEach(() => {
  jest.clearAllMocks();
});

test('afișează review-ul cu numele clientului și navigarea spre eveniment', async () => {
  await displayReviewNotification({
    id: 'review-1',
    event_id: 'event-1',
    reviewer_name: 'Maria Popescu',
    submitted_at: '2026-09-28T10:00:00+03:00',
    delivered_at: null,
  });

  expect(notifee.createChannel).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'client-reviews' }),
  );
  expect(notifee.displayNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Review nou',
      body: 'Clientul Maria Popescu ți-a lăsat un review.',
      data: { event_id: 'event-1' },
    }),
  );
});
