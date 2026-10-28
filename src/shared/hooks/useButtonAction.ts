import { useEffect, useRef, useState } from 'react';
import {
  getSessionGeneration,
  subscribeSessionChanges,
} from '@/shared/api/sessionExpiry';
import { showError } from '@/shared/feedback/showError';

export type ButtonAction = () => unknown;

export function useButtonAction(onPress: ButtonAction, disabled = false) {
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const actionId = useRef(0);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeSessionChanges(() => {
      actionId.current += 1;
      inFlight.current = false;
      setPending(false);
    });
    return () => {
      mounted.current = false;
      actionId.current += 1;
      unsubscribe();
    };
  }, []);

  const press = async () => {
    if (disabled || inFlight.current) return;
    inFlight.current = true;
    const currentAction = ++actionId.current;
    setPending(true);
    const generation = getSessionGeneration();
    try {
      await onPress();
    } catch (error) {
      if (
        mounted.current &&
        currentAction === actionId.current &&
        generation === getSessionGeneration()
      ) {
        showError(error, 'Nu am putut finaliza acțiunea.', {
          source: 'button-action',
        });
      }
    } finally {
      if (currentAction === actionId.current) {
        inFlight.current = false;
        if (mounted.current) setPending(false);
      }
    }
  };

  return { pending, press };
}
