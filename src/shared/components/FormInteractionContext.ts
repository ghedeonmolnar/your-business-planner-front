import { createContext, useContext } from 'react';

export const FormInteractionContext = createContext(false);
export const useFormBusy = () => useContext(FormInteractionContext);
