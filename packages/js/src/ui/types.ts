import type { Notification } from '../notifications';
import { NovuOptions } from '../novu';
import { Appearance, Localization } from './context';

export type NotificationClickHandler = (args: { notification: Notification }) => void;
export type NotificationActionClickHandler = (args: { notification: Notification }) => void;

export type NotificationMounter = (
  el: HTMLDivElement,
  options: {
    notification: Notification;
  }
) => () => void;
export type BellMounter = (el: HTMLDivElement, options: { unreadCount: number }) => () => void;

export type Tab = { label: string; value: Array<string> };

export type BaseNovuProviderProps = {
  appearance?: Appearance;
  localization?: Localization;
  options: NovuOptions;
  tabs?: Array<Tab>;
};

export type NovuProviderProps = BaseNovuProviderProps & {
  mountNotification?: NotificationMounter;
  mountBell?: BellMounter;
};

export enum NotificationStatus {
  UNREAD_READ = 'unreadRead',
  UNREAD = 'unread',
  ARCHIVED = 'archived',
}
