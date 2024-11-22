import React from 'react';
import { type INotificationsContext } from '../shared/interfaces';

export const NotificationsContext = React.createContext<INotificationsContext | null>(null);
