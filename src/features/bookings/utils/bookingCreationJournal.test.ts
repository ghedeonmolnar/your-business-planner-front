import * as Keychain from 'react-native-keychain';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import {
  clearBookingCreationJournal,
  loadBookingCreationJournal,
  persistBookingCreationJournal,
} from '@/features/bookings/utils/bookingCreationJournal';
import {
  advanceSessionGeneration,
  getSessionGeneration,
} from '@/shared/api/sessionExpiry';

const owner = 'company-1/user-1';
const values = {
  ...bookingFormDefaults('2027-11-13'),
  hall_id: 'hall-1',
  client_id: 'client-1',
  status: 'cancelled' as const,
};
const attempt = {
  values,
  payload: {
    ...bookingPayload(values),
    operation_id: '10000000-0000-4000-8000-000000000001',
  },
};

beforeEach(async () => {
  await clearBookingCreationJournal();
  jest.clearAllMocks();
});

test('restaureaza cheia si payloadul original dupa resetarea memoriei procesului', async () => {
  await persistBookingCreationJournal(owner, attempt, getSessionGeneration());
  expect(await loadBookingCreationJournal(owner)).toEqual({
    ...attempt,
    requiresReconciliation: false,
  });
  expect(
    await loadBookingCreationJournal('another-company/user-1'),
  ).toBeUndefined();
  await clearBookingCreationJournal();
  expect(await loadBookingCreationJournal(owner)).toBeUndefined();
});

test('refuza generatia veche si sterge jurnalul la schimbarea sesiunii', async () => {
  const generation = getSessionGeneration();
  await persistBookingCreationJournal(owner, attempt, generation);
  advanceSessionGeneration();
  await expect(
    persistBookingCreationJournal(owner, attempt, generation),
  ).rejects.toMatchObject({ reason: 'aborted' });
  expect(await loadBookingCreationJournal(owner)).toBeUndefined();
});

test('un jurnal corupt nu permite implicit crearea unei operatii noi', async () => {
  await Keychain.setGenericPassword('booking-journal', '{invalid', {
    service: 'your-business-planner-unresolved-booking',
  });
  await expect(loadBookingCreationJournal(owner)).rejects.toThrow(
    'BOOKING_JOURNAL_READ_FAILED',
  );
  expect(Keychain.resetGenericPassword).not.toHaveBeenCalled();
});

test('o operatiune veche cere reconciliere, fara sa-si schimbe identitatea', async () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(1);
  await persistBookingCreationJournal(owner, attempt, getSessionGeneration());
  now.mockReturnValue(40 * 24 * 60 * 60_000);
  try {
    expect(await loadBookingCreationJournal(owner)).toEqual({
      ...attempt,
      requiresReconciliation: true,
    });
  } finally {
    now.mockRestore();
  }
});
