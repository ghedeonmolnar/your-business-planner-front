import { createContext, useContext } from 'react';

export const FormInteractionContext = createContext(false);
export const FormFocusContext = createContext<(() => void) | undefined>(
  undefined,
);
export const useFormBusy = () => useContext(FormInteractionContext);
