import dayjs from 'dayjs';

const REMINDER_WINDOW_DAYS = 30;

export const reminderWindowRange = () => ({
  dateFrom: dayjs().format('YYYY-MM-DD'),
  dateTo: dayjs().add(REMINDER_WINDOW_DAYS, 'day').format('YYYY-MM-DD'),
});
