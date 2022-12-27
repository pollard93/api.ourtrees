/* eslint-disable camelcase */
import { NOTIFICATION_TYPE, NOTIFICATION_ON_OPEN_TYPE } from '@prisma/client';

/**
 * Define Emitter Types
 */
export enum NotificationEventType {
  DATABASE = 'DATABASE',
  PUSH = 'PUSH',
  SEND = 'SEND',
}


/**
 * Minimum required data for user
 */
export interface User {
  id: string;
  email: string;
}


/**
 * Define required data to emit a notification
 * If nothing is defined for NOTIFICATION_TYPE then data type will be null, thus nothing is required
 */
type NotificationDataType<T extends NOTIFICATION_TYPE> =
  T extends 'PASSWORD_CHANGED' ? {someData: string} :
  null;


/**
 * Define required args for creating a notification in the database
 * If NotificationDataType returns null then NotificationArgs.data is not required
 */
export type DBNotificationArgs<T extends NOTIFICATION_TYPE> =
  NotificationDataType<T> extends null
  ? {
    type: T;
    receiver: User;
    message: string;
    onOpenType: NOTIFICATION_ON_OPEN_TYPE;
    sender?: User;
  }
  : {
    type: T;
    receiver: User;
    message: string;
    onOpenType: NOTIFICATION_ON_OPEN_TYPE;
    sender?: User;
    data: NotificationDataType<T>; // Data required
  }


/**
 * Define required args to emit notification
 * With generic NOTIFICATION_TYPE mapped to NotificationArgs.type
 * If NotificationDataType returns null then NotificationArgs.data is not required
 */
export type NotificationArgs<T extends NOTIFICATION_TYPE> =
  NotificationDataType<T> extends null
  ? {
    type: T;
    receivers: User[];
    sender?: User;
    disablePush?: boolean;
  }
  : {
    type: T;
    receivers: User[];
    sender?: User;
    disablePush?: boolean;
    data: NotificationDataType<T>; // Data required
  }


/**
 * Define default push notificatiom data
 */
export interface PushNotificationData<T extends NOTIFICATION_TYPE>{
  type: T;
  notificationId: string;
  onOpenType: NOTIFICATION_ON_OPEN_TYPE;
}


/**
 * Define required data to attach to a push notification
 * If no NOTIFICATION_TYPE given, defaults to PushNotificationData
 */
export type PushNotificationDataType<T extends NOTIFICATION_TYPE> =
  T extends 'PASSWORD_CHANGED' ? {someData: string} & PushNotificationData<T> :
  PushNotificationData<T>;


/**
 * Define required args to push a notification
 * DOCS: https://documentation.onesignal.com/reference/create-notification
 */
export interface PushNotificationArgs<T extends NOTIFICATION_TYPE> {
  headings?: {
    en: string;
  };
  contents: {
    en: string;
  };
  data: PushNotificationDataType<T>;
  include_external_user_ids: string[];
  ios_badgeType?: 'None' | 'SetTo' | 'Increase'; // Defaults to Increase
  ios_badgeCount?: number; // Defaults to 1
  ios_attachments?: {[key: string]: string}; // Add images for ios (Example: {"id1": "https://domain.com/image.jpg"})
  big_picture?: string; // Image url
}
