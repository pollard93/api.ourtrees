/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Config } from './setupTests';

export {};

declare global {
  namespace NodeJS {
    interface Global {
      config: Config;
    }
  }
}
