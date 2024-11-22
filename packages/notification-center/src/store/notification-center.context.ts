import React from 'react';

import { type IMessage, type ButtonTypeEnum } from '@novu/shared';
import { type IUserPreferenceSettings } from '@novu/client';

import { type INotificationCenterContext, type ITab } from '../shared/interfaces';

export const NotificationCenterContext = React.createContext<INotificationCenterContext>({
  onUrlChange: (url: string) => {},
  onNotificationClick: (notification: IMessage) => {},
  onUnseenCountChanged: (unseenCount: number) => {},
  onActionClick: (identifier: string, type: ButtonTypeEnum, message: IMessage) => {},
  onTabClick: (tab: ITab) => {},
  preferenceFilter: (userPreference: IUserPreferenceSettings) => {},
  isLoading: true,
  header: null,
  footer: null,
  emptyState: null,
  listItem: null,
  actionsResultBlock: null,
  tabs: [],
  showUserPreferences: true,
  allowedNotificationActions: true,
} as any);
