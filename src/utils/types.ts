// eslint-disable-next-line import/no-unresolved
import { Request, Response } from 'express';
import { Prisma } from '../prisma';
import EmailEmitter from '../events/email/EmailEmitter';
import NotificationEmitter from '../events/notification/NotificationEmitter';
import { TokenArgs, TokenType } from '../modules/Auth/interfaces';


export enum CLIENT_TYPE {
  'MOBILE' = 'MOBILE',
  'WEB' = 'WEB',
}


/**
 * Define custom headers
 */
declare module 'http' {
  interface IncomingHttpHeaders {
    'client-version': string;
    'client-type': CLIENT_TYPE;
  }
}


/**
 * Define Context
 */
export interface VerifiedToken<T extends TokenType | null> {
  data: TokenArgs<T> | null;
  error?: Error;
}


export interface Context<T extends TokenType | null> {
  req: Request;
  res: Response;
  db: Prisma;
  accessToken: TokenArgs<T>;
  clientType: CLIENT_TYPE;
  clientVersion: string;
  fileCacheBuster?: boolean; // Set to bust file cache (see: `src/resolvers/payloads/Url.ts`)
  notificationEvents: NotificationEmitter;
  emailEvents: EmailEmitter;
}
