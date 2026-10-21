import React, { ComponentType } from 'react';
import { useIsFocused } from '@react-navigation/native';

export const createResettingTabScreen = (ScreenComponent: ComponentType) => {
  function ResettingTabScreen() {
    const isFocused = useIsFocused();

    return isFocused ? <ScreenComponent /> : null;
  }

  return ResettingTabScreen;
};
