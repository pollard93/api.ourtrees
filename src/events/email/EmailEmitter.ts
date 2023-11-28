import { EventEmitter } from 'events';
import { MailDataRequired } from '@sendgrid/mail';
import {
  EMAIL_EVENT_TYPE,
  EMAIL_TRANSACTIONAL_TYPE,
  TransactionalEmailArgs,
  InternalEmailArgs,
  EMAIL_INTERNAL_TYPE,
} from './types';

export default class EmailEmitter extends EventEmitter {
  emitRawEmail(data: MailDataRequired) {
    return this.emit(EMAIL_EVENT_TYPE.RAW, data);
  }

  emitTransactionalEmail<T extends EMAIL_TRANSACTIONAL_TYPE>(data: TransactionalEmailArgs<T>) {
    return this.emit(EMAIL_EVENT_TYPE.TRANSACTIONAL, data);
  }

  emitInternalEmail<T extends EMAIL_INTERNAL_TYPE>(data: InternalEmailArgs<T>) {
    return this.emit(EMAIL_EVENT_TYPE.INERNAL, data);
  }
}
