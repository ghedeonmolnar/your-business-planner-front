import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { useAgendaClock } from '@/features/company/hooks/useAgendaClock';

let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocused,
}));

function ClockProbe() {
  const { now } = useAgendaClock();
  return <Text>{now}</Text>;
}

test('actualizează ceasul în tabul activ, îl reia la revenire și curăță timerul', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-24T10:00:00Z'));
  mockFocused = true;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ClockProbe />);
    });
    const initial = renderer?.root.findByType(Text).props.children;
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(renderer?.root.findByType(Text).props.children).toBe(
      initial + 30_000,
    );
    mockFocused = false;
    await ReactTestRenderer.act(async () => {
      renderer?.update(<ClockProbe />);
    });
    expect(jest.getTimerCount()).toBe(0);
    jest.setSystemTime(new Date('2026-10-25T10:00:00Z'));
    mockFocused = true;
    await ReactTestRenderer.act(async () => {
      renderer?.update(<ClockProbe />);
    });
    expect(renderer?.root.findByType(Text).props.children).toBe(Date.now());
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
    });
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    jest.useRealTimers();
  }
});
