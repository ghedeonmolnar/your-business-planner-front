import * as Keychain from 'react-native-keychain';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';
import {
  calendarAvailabilityEpoch,
  clearCalendarAvailability,
  invalidateStoredCalendarAvailability,
  loadCalendarAvailability,
  persistCalendarAvailability,
  setCalendarAvailabilityOwner,
} from '@/shared/storage/calendarAvailabilityStorage';
import {
  advanceSessionGeneration,
  getSessionGeneration,
} from '@/shared/api/sessionExpiry';

const owner = 'api|company-1|owner-1|owner|';
const window: CalendarAvailabilityWindow = {
  owner,
  hallId: 'hall-1',
  from: '2027-11-01',
  to: '2028-04-30',
  occupiedDates: ['2027-11-14', '2028-02-29'],
  revision: 'a'.repeat(64),
  invalidated: false,
  lastUsedAt: 1,
};

beforeEach(async () => {
  await setCalendarAvailabilityOwner(owner);
  await clearCalendarAvailability();
});

test('persistă numai disponibilitatea criptată și o izolează pe identitate', async () => {
  await persistCalendarAvailability(window, getSessionGeneration());
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'calendar-cache',
    expect.any(String),
    expect.objectContaining({
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  );
  expect(await loadCalendarAvailability(owner)).toEqual([window]);
  expect(
    await loadCalendarAvailability('api|other-company|other-user|owner|'),
  ).toEqual([]);
});

test('o revizie identică păstrează cache-ul, iar invalidarea explicită îl marchează pentru actualizare', async () => {
  await persistCalendarAvailability(window, getSessionGeneration());
  await invalidateStoredCalendarAvailability('company-1', window.revision);
  expect((await loadCalendarAvailability(owner))[0].invalidated).toBe(false);
  await invalidateStoredCalendarAvailability('company-1');
  expect((await loadCalendarAvailability(owner))[0].invalidated).toBe(true);
});

test('o scriere începută înainte de invalidare nu poate marca datele vechi drept actuale', async () => {
  await persistCalendarAvailability(window, getSessionGeneration());
  const epoch = calendarAvailabilityEpoch('company-1');
  await invalidateStoredCalendarAvailability('company-1');
  await persistCalendarAvailability(window, getSessionGeneration(), epoch);
  expect((await loadCalendarAvailability(owner))[0].invalidated).toBe(true);
});

test('schimbarea sesiunii respinge scrierile vechi și șterge cache-ul', async () => {
  await persistCalendarAvailability(window, getSessionGeneration());
  const generation = getSessionGeneration();
  advanceSessionGeneration();
  await expect(
    persistCalendarAvailability(window, generation),
  ).rejects.toThrow();
  expect(await loadCalendarAvailability(owner)).toEqual([]);
});

test('schimbarea identității elimină datele identității precedente', async () => {
  await persistCalendarAvailability(window, getSessionGeneration());
  await setCalendarAvailabilityOwner('api|company-2|owner-2|owner|');
  expect(await loadCalendarAvailability(owner)).toEqual([]);
  await setCalendarAvailabilityOwner(owner);
  expect(await loadCalendarAvailability(owner)).toEqual([]);
});

test('prima identitate verificată elimină cache-ul restaurat al altei identități', async () => {
  advanceSessionGeneration();
  await clearCalendarAvailability();
  jest.mocked(Keychain.resetGenericPassword).mockClear();
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    username: 'calendar-cache',
    password: JSON.stringify({ version: 1, windows: [window] }),
    service: 'cache',
    storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  });
  await setCalendarAvailabilityOwner('api|company-2|owner-2|owner|');
  expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
    expect.objectContaining({
      service: 'your-business-planner-calendar-availability-v1',
    }),
  );
  expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
  expect(await loadCalendarAvailability(owner)).toEqual([]);
});

test('datele corupte se elimină și permit încărcarea de pe server', async () => {
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    username: 'cache',
    password: '{invalid',
    service: 'cache',
    storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  });
  expect(await loadCalendarAvailability(owner)).toEqual([]);
});

test('elimină intrările folosite cel mai demult când depășește plafonul', async () => {
  const occupiedDates = Array.from({ length: 181 }, (_, day) =>
    new Date(Date.UTC(2027, 10, day + 1)).toISOString().slice(0, 10),
  );
  for (let index = 0; index < 80; index++)
    await persistCalendarAvailability(
      { ...window, hallId: `hall-${index}`, occupiedDates, lastUsedAt: index },
      getSessionGeneration(),
    );
  const retained = await loadCalendarAvailability(owner);
  expect(retained.length).toBeLessThan(80);
  expect(retained.some(entry => entry.hallId === 'hall-0')).toBe(false);
  expect(retained.some(entry => entry.hallId === 'hall-79')).toBe(true);
});
