import { useEffect, useState } from 'react';
import {
  getBookingCreationAttempt,
  rememberBookingCreationAttempt,
  BookingCreationAttempt,
} from '@/features/bookings/utils/bookingCreationRecovery';
import { loadBookingCreationJournal } from '@/features/bookings/utils/bookingCreationJournal';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export const useBookingCreationRecovery = (owner: string, editing: boolean) => {
  const [attempt, setAttempt] = useState<BookingCreationAttempt | undefined>(
    () => (editing ? undefined : getBookingCreationAttempt(owner)),
  );
  const [loading, setLoading] = useState(!editing && !attempt);
  const [error, setError] = useState<unknown>();
  const [revision, retry] = useState(0);
  useEffect(() => {
    if (editing || getBookingCreationAttempt(owner)) return;
    const generation = getSessionGeneration();
    let cancelled = false;
    setLoading(true);
    void loadBookingCreationJournal(owner, generation)
      .then(value => {
        if (cancelled || generation !== getSessionGeneration()) return;
        if (value) rememberBookingCreationAttempt(owner, value);
        setAttempt(value);
        setError(undefined);
      })
      .catch(failure => {
        if (!cancelled && generation === getSessionGeneration())
          setError(failure);
      })
      .finally(() => {
        if (!cancelled && generation === getSessionGeneration())
          setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, editing, revision]);
  return { attempt, loading, error, retry: () => retry(value => value + 1) };
};
