import { User as DbUser } from '@prisma/client/index';
import { CLIENT_TYPE } from '../../utils/types';


/**
 * Define Emitter Types
 */
export enum EMAIL_EVENT_TYPE {
  RAW = 'RAW',
  TRANSACTIONAL = 'TRANSACTIONAL',
  INERNAL = 'INERNAL',
}


/**
 * Minimum required data for user
 */
export interface User {
  id: string;
  email: string;
}


/**
 * Define transactional email types
 */
export enum EMAIL_TRANSACTIONAL_TYPE {
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_EMAIL_CHANGE = 'VERIFY_EMAIL_CHANGE',
}


/**
 * Define default push transactional email data
 */
export interface TransactionalDefaultData {
  clientType: CLIENT_TYPE;
}


/**
 * Define required data to emit a transactional email
 * If nothing is defined for EMAIL_TRANSACTIONAL_TYPE then data type will be null, thus nothing is required
 */
type TransactionalDataType<T extends EMAIL_TRANSACTIONAL_TYPE> =
  T extends EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN ? {token: string} & TransactionalDefaultData :
  T extends EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL ? {token: string} & TransactionalDefaultData :
  T extends EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE ? {token: string} & TransactionalDefaultData :
  null;


/**
 * Define required args to emit transational email
 * With generic EMAIL_TRANSACTIONAL_TYPE mapped to TransactionalEmailArgs.type
 * If TransactionalDataType returns null then TransactionalEmailArgs.data is not required
 */
export type TransactionalEmailArgs<T extends EMAIL_TRANSACTIONAL_TYPE> =
  TransactionalDataType<T> extends null
  ? {
    type: T;
    receivers: User[];
  }
  : {
    type: T;
    receivers: User[];
    data: TransactionalDataType<T>; // Data required
  }


/**
 * Define internal email types
 */
export enum EMAIL_INTERNAL_TYPE {
  USER_REGISTERED = 'USER_REGISTERED',
}


/**
 * Define required data to emit a email
 * If nothing is defined for EMAIL_INTERNAL_TYPE then data type will be null, thus nothing is required
 */
type InternalDataType<T extends EMAIL_INTERNAL_TYPE> =
  T extends EMAIL_INTERNAL_TYPE.USER_REGISTERED ? {user: DbUser} :
  null;


/**
 * Define required args to emit internal email
 * With generic EMAIL_INTERNAL_TYPE mapped to InternalEmailArgs.type
 * If InternalDataType returns null then InternalEmailArgs.data is not required
 */
export type InternalEmailArgs<T extends EMAIL_INTERNAL_TYPE> =
  InternalDataType<T> extends null
  ? {
    type: T;
  }
  : {
    type: T;
    data: InternalDataType<T>; // Data required
  }
