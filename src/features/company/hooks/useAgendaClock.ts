import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const AGENDA_CLOCK_INTERVAL_MS = 30_000;

export function useAgendaClock() {
  const focused = useIsFocused();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!focused) return;
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, AGENDA_CLOCK_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [focused]);
  return { now, focused };
}
