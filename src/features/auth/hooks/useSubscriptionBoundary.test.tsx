import React, { useRef, useState } from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { useSubscriptionBoundary } from '@/features/auth/hooks/useSubscriptionBoundary';
import { getMeApi } from '@/features/auth/api/authApi';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { AuthUser } from '@/features/auth/types';

jest.mock('@/features/auth/api/authApi', () => ({ getMeApi: jest.fn() }));
jest.mock('@/shared/monitoring/reportError', () => ({
  reportError: jest.fn(),
}));

const boundary = '2026-10-24T10:00:01Z';
const initial = {
  ...plannerAccount,
  subscription: { active: true, ends_at: boundary, suspended: false },
};
const renewed = {
  ...initial,
  subscription: { ...initial.subscription, ends_at: '2026-11-24T10:00:01Z' },
};

function Probe() {
  const [user, setUser] = useState<AuthUser | null>(initial);
  const [draft] = useState('ciornă nesalvată');
  const generation = useRef(1);
  const checking = useSubscriptionBoundary(user, setUser, generation);
  return (
    <Text>
      {user?.subscription?.active ? 'activ' : 'blocat'} ·{' '}
      {checking ? 'verificare' : 'gata'} · {draft}
    </Text>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-24T10:00:00Z'));
  jest.mocked(getMeApi).mockReset();
});
afterEach(() => jest.useRealTimers());

test('revalidează perioadele consecutive fără a demonta ciorna la limita locală', async () => {
  let release: (profile: AuthUser) => void = () => undefined;
  jest.mocked(getMeApi).mockImplementation(
    () =>
      new Promise(resolve => {
        release = resolve;
      }),
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(getMeApi).toHaveBeenCalledTimes(1);
  expect(renderer?.root.findByType(Text).props.children.join('')).toContain(
    'activ · verificare · ciornă nesalvată',
  );
  await ReactTestRenderer.act(async () => {
    release(renewed);
  });
  expect(renderer?.root.findByType(Text).props.children.join('')).toContain(
    'activ · gata · ciornă nesalvată',
  );
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

test('offline păstrează verificarea și ciorna până la un răspuns autoritar', async () => {
  jest
    .mocked(getMeApi)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(renewed);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(renderer?.root.findByType(Text).props.children.join('')).toContain(
    'verificare',
  );
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(renderer?.root.findByType(Text).props.children.join('')).toContain(
    'activ · gata · ciornă nesalvată',
  );
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
