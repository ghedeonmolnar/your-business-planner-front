import { AppState } from 'react-native';
import { focusManager } from '@tanstack/react-query';

let isConfigured = false;

export const configureQueryFocus = () => {
  if (isConfigured) {
    return;
  }

  focusManager.setEventListener(handleFocus => {
    const subscription = AppState.addEventListener('change', state => {
      handleFocus(state === 'active');
    });

    return () => subscription.remove();
  });

  isConfigured = true;
};
