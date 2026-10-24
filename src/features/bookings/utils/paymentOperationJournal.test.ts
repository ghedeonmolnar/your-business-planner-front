import * as Keychain from 'react-native-keychain';
import {
  clearPaymentOperations,
  loadPaymentOperations,
  rememberPaymentOperation,
  resolvePaymentOperation,
} from '@/features/bookings/utils/paymentOperationJournal';
import {
  advanceSessionGeneration,
  getSessionGeneration,
} from '@/shared/api/sessionExpiry';

const operation = {
  eventId: 'event-1',
  payload: {
    operation_id: 'edb9b58b-4bd1-4f43-a636-f6621d22018a',
    type: 'incoming' as const,
    category: 'advance',
    amount: '1000.00',
    paid_at: '2026-10-24',
    method: 'transfer' as const,
    status: 'completed' as const,
    notes: '',
  },
};

beforeEach(async () => {
  await clearPaymentOperations();
  jest.clearAllMocks();
});

test('persistă payloadul exact în Keychain și îl elimină numai după reconciliere', async () => {
  const generation = getSessionGeneration();
  await rememberPaymentOperation('company-1/owner-1', operation, generation);
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'payment-journal',
    expect.any(String),
    expect.objectContaining({ service: 'gt-events-unresolved-payments' }),
  );
  expect(await loadPaymentOperations('company-1/owner-1')).toEqual([operation]);
  await expect(
    rememberPaymentOperation(
      'company-1/owner-1',
      { ...operation, payload: { ...operation.payload, amount: '1200.00' } },
      generation,
    ),
  ).rejects.toThrow('PAYMENT_OPERATION_UNRESOLVED');
  await resolvePaymentOperation(
    'company-1/owner-1',
    operation.payload.operation_id,
    generation,
  );
  expect(await loadPaymentOperations('company-1/owner-1')).toEqual([]);
});

test('nu expune operațiile altei identități și refuză scrierile din sesiunea precedentă', async () => {
  const generation = getSessionGeneration();
  await rememberPaymentOperation('company-1/owner-1', operation, generation);
  expect(await loadPaymentOperations('company-2/owner-2')).toEqual([]);
  await rememberPaymentOperation('company-1/owner-1', operation, generation);
  advanceSessionGeneration();
  await expect(
    rememberPaymentOperation('company-1/owner-1', operation, generation),
  ).rejects.toMatchObject({ reason: 'aborted' });
  expect(await loadPaymentOperations('company-1/owner-1')).toEqual([]);
});

test('eșecul stocării și datele corupte opresc recuperarea în loc să inventeze o operație nouă', async () => {
  jest
    .mocked(Keychain.setGenericPassword)
    .mockRejectedValueOnce(new Error('Storage unavailable'));
  await expect(
    rememberPaymentOperation('owner', operation, getSessionGeneration()),
  ).rejects.toThrow('Storage unavailable');
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    password: '{invalid',
    username: 'payment-journal',
    service: 'gt-events-unresolved-payments',
    storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  });
  await expect(loadPaymentOperations('owner')).rejects.toThrow();
});
