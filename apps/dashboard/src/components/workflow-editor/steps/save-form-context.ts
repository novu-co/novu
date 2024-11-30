import React from 'react';

type SaveFormContextValue = {
  saveForm: () => Promise<void>;
};

export const SaveFormContext = React.createContext<SaveFormContextValue>({} as SaveFormContextValue);

export const useSaveForm = () => React.useContext(SaveFormContext);
