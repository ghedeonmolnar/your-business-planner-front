import { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  useWindowDimensions,
  type KeyboardEvent,
} from 'react-native';

export const useKeyboardOverlap = (enabled: boolean) => {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setKeyboardOverlap(0);
      return undefined;
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(
      showEvent,
      (event: KeyboardEvent) => {
        if (Platform.OS === 'ios') {
          Keyboard.scheduleLayoutAnimation(event);
        }

        const coordinates = event.endCoordinates;

        setKeyboardOverlap(
          coordinates?.screenY === undefined
            ? (coordinates?.height ?? 0)
            : Math.max(windowHeight - coordinates.screenY, 0),
        );
      },
    );
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardOverlap(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [enabled, windowHeight]);

  return keyboardOverlap;
};
