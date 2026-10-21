import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

let isConfigured = false;

export const configureQueryOnline = () => {
  if (isConfigured) {
    return;
  }

  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => {
      setOnline(
        Boolean(state.isConnected) && state.isInternetReachable !== false,
      );
    }),
  );

  isConfigured = true;
};
