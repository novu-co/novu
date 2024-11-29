import React from 'react';

type FlashFormUpdatesContextValue = {
  flushFormUpdates: () => Promise<void>;
};

export const FlashFormUpdatesContext = React.createContext<FlashFormUpdatesContextValue>(
  {} as FlashFormUpdatesContextValue
);

export const useFlushFormUpdates = () => React.useContext(FlashFormUpdatesContext);
