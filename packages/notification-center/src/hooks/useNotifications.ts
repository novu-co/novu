import { useContext } from 'react';

import { NotificationsContext } from '../store/notifications.context';
import { type INotificationsContext } from '../shared/interfaces';

export function useNotifications() {
  return useContext<INotificationsContext>(NotificationsContext);
}
