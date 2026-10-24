import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppState, Text } from 'react-native';
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
  const intervalSpy = jest.spyOn(globalThis, 'setInterval');
  const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
  const removeListener = jest.fn();
  jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: removeListener });
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ClockProbe />);
    });
    const initial = renderer?.root.findByType(Text).props.children;
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 30_000);
    const firstInterval = intervalSpy.mock.results[0].value;
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
    expect(clearIntervalSpy).toHaveBeenCalledWith(firstInterval);
    expect(removeListener).toHaveBeenCalledTimes(1);
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(renderer?.root.findByType(Text).props.children).toBe(
      initial + 30_000,
    );
    jest.setSystemTime(new Date('2026-10-25T10:00:00Z'));
    mockFocused = true;
    await ReactTestRenderer.act(async () => {
      renderer?.update(<ClockProbe />);
    });
    expect(renderer?.root.findByType(Text).props.children).toBe(Date.now());
    expect(intervalSpy).toHaveBeenCalledTimes(2);
    const resumedInterval = intervalSpy.mock.results[1].value;
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
    });
    expect(clearIntervalSpy).toHaveBeenCalledWith(resumedInterval);
    expect(removeListener).toHaveBeenCalledTimes(2);
  } finally {
    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
    });
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});
