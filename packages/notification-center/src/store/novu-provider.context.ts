import React from 'react';
import { type INovuProviderContext } from '../shared/interfaces';

export const NovuContext = React.createContext<INovuProviderContext | null>(null);
