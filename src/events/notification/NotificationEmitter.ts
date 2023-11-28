import { EventEmitter } from 'events';
import { NOTIFICATION_TYPE } from '@prisma/client';
import {
  DBNotificationArgs,
  NotificationEventType,
  PushNotificationArgs,
  NotificationArgs,
} from './types';

export default class NotificationEmitter extends EventEmitter {
  emitDBNotification<T extends NOTIFICATION_TYPE>(data: DBNotificationArgs<T>) {
    return this.emit(NotificationEventType.DATABASE, data);
  }

  emitPushNotification<T extends NOTIFICATION_TYPE>(data: PushNotificationArgs<T>) {
    return this.emit(NotificationEventType.PUSH, data);
  }

  emitNotification<T extends NOTIFICATION_TYPE>(data: NotificationArgs<T>) {
    return this.emit(NotificationEventType.SEND, data);
  }
}
