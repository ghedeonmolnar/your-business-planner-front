import * as Keychain from 'react-native-keychain';
import { z } from 'zod';
import { bookingPaymentSchema } from '@/features/bookings/schemas/paymentSchema';
import { BookingPaymentPayload } from '@/features/bookings/types';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import { reportError } from '@/shared/monitoring/reportError';

const PAYMENT_JOURNAL_SERVICE = 'gt-events-unresolved-payments';
const KEYCHAIN_OPTIONS = { service: PAYMENT_JOURNAL_SERVICE };
const operationSchema = z.object({
  eventId: z.string().min(1),
  payload: bookingPaymentSchema.and(z.object({ operation_id: z.uuid() })),
});
const journalSchema = z.object({
  owner: z.string().min(1),
  operations: z.array(operationSchema),
});
export type PaymentOperation = z.infer<typeof operationSchema>;
let pendingStorageOperation: Promise<void> = Promise.resolve();

const serialize = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = pendingStorageOperation.then(operation);
  pendingStorageOperation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

const readJournal = async (owner: string): Promise<PaymentOperation[]> => {
  const stored = await Keychain.getGenericPassword(KEYCHAIN_OPTIONS);
  if (!stored) return [];
  const journal = (() => {
    try {
      return journalSchema.parse(JSON.parse(stored.password));
    } catch {
      throw new Error('PAYMENT_JOURNAL_READ_FAILED');
    }
  })();
  if (journal.owner !== owner) {
    await writeJournal(owner, []);
    return [];
  }
  return journal.operations;
};

const writeJournal = async (owner: string, operations: PaymentOperation[]) => {
  const saved = operations.length
    ? await Keychain.setGenericPassword(
        'payment-journal',
        JSON.stringify({ owner, operations }),
        {
          ...KEYCHAIN_OPTIONS,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        },
      )
    : await Keychain.resetGenericPassword(KEYCHAIN_OPTIONS);
  if (!saved) throw new Error('PAYMENT_JOURNAL_WRITE_FAILED');
};

export const loadPaymentOperations = (
  owner: string,
  generation = getSessionGeneration(),
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const operations = await readJournal(owner);
    assertCurrentRequestSession(generation);
    return operations;
  });

export const rememberPaymentOperation = (
  owner: string,
  operation: { eventId: string; payload: BookingPaymentPayload },
  generation: number,
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const entry = operationSchema.parse(operation);
    const operations = await readJournal(owner);
    assertCurrentRequestSession(generation);
    const existing = operations.find(item => item.eventId === entry.eventId);
    if (existing && JSON.stringify(existing) !== JSON.stringify(entry)) {
      throw new Error('PAYMENT_OPERATION_UNRESOLVED');
    }
    const next = existing ? operations : [...operations, entry];
    await writeJournal(owner, next);
    assertCurrentRequestSession(generation);
    return { operations: next, recovering: Boolean(existing) };
  });

export const resolvePaymentOperation = (
  owner: string,
  operationId: string,
  generation: number,
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const operations = await readJournal(owner);
    assertCurrentRequestSession(generation);
    const next = operations.filter(
      item => item.payload.operation_id !== operationId,
    );
    await writeJournal(owner, next);
    assertCurrentRequestSession(generation);
    return next;
  });

export const clearPaymentOperations = () =>
  serialize(async () => {
    await writeJournal('', []);
  });

subscribeSessionChanges(() => {
  void clearPaymentOperations().catch(error =>
    reportError(error, { source: 'clear-payment-journal' }),
  );
});
