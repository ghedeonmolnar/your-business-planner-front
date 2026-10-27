import * as Keychain from 'react-native-keychain';
import { bookingCreationJournalSchema } from '@/features/bookings/schemas/bookingCreationJournalSchema';
import type { BookingCreationAttempt } from '@/features/bookings/utils/bookingCreationRecovery';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import { reportError } from '@/shared/monitoring/reportError';

const OPTIONS = { service: 'your-business-planner-unresolved-booking' };
const RECONCILIATION_AGE_MS = 30 * 24 * 60 * 60_000;
const MAXIMUM_JOURNAL_LENGTH = 512_000;
let pending: Promise<unknown> = Promise.resolve();

const serialize = <T>(operation: () => Promise<T>) => {
  const result = pending.then(operation);
  pending = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

export const loadBookingCreationJournal = (
  owner: string,
  generation = getSessionGeneration(),
) =>
  serialize(async (): Promise<BookingCreationAttempt | undefined> => {
    assertCurrentRequestSession(generation);
    const stored = await Keychain.getGenericPassword(OPTIONS);
    assertCurrentRequestSession(generation);
    if (!stored) return undefined;
    let journal;
    try {
      if (stored.password.length > MAXIMUM_JOURNAL_LENGTH) throw new Error();
      journal = bookingCreationJournalSchema.parse(JSON.parse(stored.password));
    } catch {
      throw new Error('BOOKING_JOURNAL_READ_FAILED');
    }
    if (journal.owner !== owner) return undefined;
    return {
      ...journal.attempt,
      requiresReconciliation:
        journal.attempt.requiresReconciliation ||
        Date.now() - journal.savedAt > RECONCILIATION_AGE_MS,
    };
  });

export const persistBookingCreationJournal = (
  owner: string,
  attempt: BookingCreationAttempt,
  generation: number,
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const journal = bookingCreationJournalSchema.parse({
      owner,
      attempt,
      savedAt: Date.now(),
    });
    const serialized = JSON.stringify(journal);
    if (serialized.length > MAXIMUM_JOURNAL_LENGTH)
      throw new Error('BOOKING_JOURNAL_TOO_LARGE');
    const saved = await Keychain.setGenericPassword(
      'booking-journal',
      serialized,
      {
        ...OPTIONS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
    if (!saved) throw new Error('BOOKING_JOURNAL_WRITE_FAILED');
    assertCurrentRequestSession(generation);
  });

export const clearBookingCreationJournal = (generation?: number) =>
  serialize(async () => {
    if (generation !== undefined) assertCurrentRequestSession(generation);
    const cleared = await Keychain.resetGenericPassword(OPTIONS);
    if (!cleared) throw new Error('BOOKING_JOURNAL_CLEAR_FAILED');
    if (generation !== undefined) assertCurrentRequestSession(generation);
  });

subscribeSessionChanges(() => {
  void clearBookingCreationJournal().catch(error =>
    reportError(error, { source: 'clear-booking-journal' }),
  );
});
