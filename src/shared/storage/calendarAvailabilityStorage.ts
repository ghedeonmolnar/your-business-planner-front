import * as Keychain from 'react-native-keychain';
import {
  CalendarAvailabilityWindow,
  calendarAvailabilityStorageSchema,
  calendarAvailabilityWindowSchema,
} from '@/shared/storage/calendarAvailabilitySchema';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import { reportError } from '@/shared/monitoring/reportError';

const OPTIONS = { service: 'your-business-planner-calendar-availability-v1' };
const MAXIMUM_STORAGE_BYTES = 256 * 1024;
let pending: Promise<unknown> = Promise.resolve();
let activeOwner: string | undefined;
const revisions = new Map<string, string | undefined>();
const epochs = new Map<string, number>();

export const calendarAvailabilityEpoch = (companyId: string) =>
  epochs.get(companyId) ?? 0;

export const isCalendarAvailabilityCurrent = (
  companyId: string,
  epoch: number,
  revision: string,
) =>
  epoch === calendarAvailabilityEpoch(companyId) ||
  revisions.get(companyId) === revision;

const serialize = <T>(operation: () => Promise<T>) => {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
};

const readWindows = async (): Promise<CalendarAvailabilityWindow[]> => {
  const stored = await Keychain.getGenericPassword(OPTIONS);
  if (!stored) return [];
  try {
    if (stored.password.length * 2 > MAXIMUM_STORAGE_BYTES)
      throw new Error('CALENDAR_CACHE_TOO_LARGE');
    return calendarAvailabilityStorageSchema.parse(JSON.parse(stored.password))
      .windows;
  } catch {
    reportError(new Error('CALENDAR_CACHE_INVALID'), {
      source: 'calendar-cache',
    });
    if (!(await Keychain.resetGenericPassword(OPTIONS)))
      throw new Error('CALENDAR_CACHE_CLEAR_FAILED');
    return [];
  }
};

const writeWindows = async (windows: CalendarAvailabilityWindow[]) => {
  const retained = [...windows].sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  let serialized = JSON.stringify({ version: 1, windows: retained });
  while (serialized.length * 2 > MAXIMUM_STORAGE_BYTES && retained.length) {
    retained.pop();
    serialized = JSON.stringify({ version: 1, windows: retained });
  }
  const saved = retained.length
    ? await Keychain.setGenericPassword('calendar-cache', serialized, {
        ...OPTIONS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
    : await Keychain.resetGenericPassword(OPTIONS);
  if (!saved) throw new Error('CALENDAR_CACHE_WRITE_FAILED');
};

export const loadCalendarAvailability = (
  owner: string,
  generation = getSessionGeneration(),
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const windows = await readWindows();
    assertCurrentRequestSession(generation);
    if (activeOwner !== undefined && activeOwner !== owner) return [];
    return windows.filter(window => window.owner === owner);
  });

export const persistCalendarAvailability = (
  window: CalendarAvailabilityWindow,
  generation: number,
  epoch = calendarAvailabilityEpoch(window.owner.split('|')[1]),
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const entry = calendarAvailabilityWindowSchema.parse(window);
    const windows = await readWindows();
    assertCurrentRequestSession(generation);
    const companyId = entry.owner.split('|')[1];
    if (activeOwner !== undefined && activeOwner !== entry.owner) return;
    if (!isCalendarAvailabilityCurrent(companyId, epoch, entry.revision))
      return;
    const retained = windows.filter(
      cached =>
        cached.owner === entry.owner &&
        !(
          cached.hallId === entry.hallId &&
          cached.excludedEventId === entry.excludedEventId &&
          cached.from === entry.from &&
          cached.to === entry.to
        ),
    );
    await writeWindows([...retained, entry]);
    assertCurrentRequestSession(generation);
  });

export const invalidateStoredCalendarAvailability = (
  companyId: string,
  revision?: string,
  generation = getSessionGeneration(),
) => {
  if (revision && revisions.get(companyId) === revision)
    return Promise.resolve();
  revisions.set(companyId, revision);
  epochs.set(companyId, calendarAvailabilityEpoch(companyId) + 1);
  return serialize(async () => {
    assertCurrentRequestSession(generation);
    const windows = await readWindows();
    assertCurrentRequestSession(generation);
    const next = windows.map(window =>
      window.owner.split('|')[1] === companyId &&
      (!revision || window.revision !== revision)
        ? { ...window, invalidated: true }
        : window,
    );
    if (next.some((window, index) => window !== windows[index]))
      await writeWindows(next);
    assertCurrentRequestSession(generation);
  }).catch(error => {
    if (revisions.get(companyId) === revision) revisions.delete(companyId);
    throw error;
  });
};

export const clearCalendarAvailability = () =>
  serialize(async () => {
    if (!(await Keychain.resetGenericPassword(OPTIONS)))
      throw new Error('CALENDAR_CACHE_CLEAR_FAILED');
  });

export const setCalendarAvailabilityOwner = (owner: string) => {
  const previous = activeOwner;
  activeOwner = owner;
  if (previous === owner) return Promise.resolve();
  if (previous !== undefined) return clearCalendarAvailability();
  return serialize(async () => {
    const windows = await readWindows();
    if (activeOwner === owner && windows.some(window => window.owner !== owner))
      await writeWindows([]);
  });
};

export const touchCalendarAvailability = (
  window: CalendarAvailabilityWindow,
  generation = getSessionGeneration(),
) =>
  serialize(async () => {
    assertCurrentRequestSession(generation);
    const windows = await readWindows();
    assertCurrentRequestSession(generation);
    if (activeOwner !== undefined && activeOwner !== window.owner) return;
    const next = windows.map(cached =>
      cached.owner === window.owner &&
      cached.hallId === window.hallId &&
      cached.excludedEventId === window.excludedEventId &&
      cached.from === window.from
        ? { ...cached, lastUsedAt: Date.now() }
        : cached,
    );
    if (next.some((cached, index) => cached !== windows[index]))
      await writeWindows(next);
  });

subscribeSessionChanges(() => {
  activeOwner = undefined;
  revisions.clear();
  epochs.clear();
  void clearCalendarAvailability().catch(error =>
    reportError(error, { source: 'clear-calendar-cache' }),
  );
});
