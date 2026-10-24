import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { HallPhotoDraft } from '@/features/halls/types';
import { subscribeSessionChanges } from '@/shared/api/sessionExpiry';

export type HallCreationAttempt = {
  body: FormData;
  values: HallFormValues;
  photos: HallPhotoDraft[];
  operationId: string;
  conflict?: boolean;
};

const attempts = new Map<string, HallCreationAttempt>();

export const getHallCreationAttempt = (key: string) => attempts.get(key);
export const rememberHallCreationAttempt = (
  key: string,
  attempt: HallCreationAttempt,
) => attempts.set(key, attempt);
export const forgetHallCreationAttempt = (key: string) => attempts.delete(key);

subscribeSessionChanges(() => attempts.clear());
