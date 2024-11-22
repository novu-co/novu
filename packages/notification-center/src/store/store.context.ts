import React from 'react';

import { type IStoreContext } from '../shared/interfaces';

export const StoreContext = React.createContext<IStoreContext | null>(null);
