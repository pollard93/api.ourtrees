/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
/* eslint-disable no-void */
/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { PrismaClient } from '@prisma/client';
import { reduceArgs } from './utils';
import EmailEmitter from '../src/events/email/EmailEmitter';
import EmailListener from '../src/events/email/EmailListener';
import { InitFileHandler } from '../src/modules/FileHandler';
import { EMAIL_TRANSACTIONAL_TYPE, EMAIL_INTERNAL_TYPE } from '../src/events/email/types';
import { generateToken } from '../src/modules/Auth';
import { TokenType } from '../src/modules/Auth/interfaces';
import { CLIENT_TYPE } from '../src/utils/types';

dotenv.config();
InitFileHandler();

/**
 * Utility to send individual emails with actual data
 */
void (async function () {
  const prisma = new PrismaClient();

  /**
   * Set emitter and listener
   */
  const emitter = new EmailEmitter();
  // eslint-disable-next-line no-new
  new EmailListener(emitter);

  /**
   * Get target user
   */
  const targetUser = await prisma.user.findUnique({ where: { email: 'dev@madebyprism.com' } });

  /**
   * Get and validate args
   */
  const { type, clientType } = reduceArgs<{
    type: EMAIL_TRANSACTIONAL_TYPE | EMAIL_INTERNAL_TYPE;
    clientType: CLIENT_TYPE;
  }>();
  if (!type) {
    console.error(chalk.red("Please supply argument: 'type'"));
    process.exit(0);
  }

  if (!clientType) {
    console.error(chalk.red("Please supply argument: 'clientType'"));
    process.exit(0);
  }

  /**
   * Emit notification based on type
   * Creates requires data
   */
  switch (type) {
    case EMAIL_TRANSACTIONAL_TYPE.PASSWORD_CHANGED:
      emitter.emitTransactionalEmail({
        type: EMAIL_TRANSACTIONAL_TYPE.PASSWORD_CHANGED,
        receivers: [targetUser],
      });
      break;

    case EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN:
      emitter.emitTransactionalEmail({
        type: EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN,
        receivers: [targetUser],
        data: {
          clientType,
          token: generateToken({
            type: TokenType.RESET,
            data: {
              email: targetUser.email,
            },
          }),
        },
      });
      break;

    case EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL:
      emitter.emitTransactionalEmail({
        type: EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL,
        receivers: [targetUser],
        data: {
          clientType,
          token: generateToken({
            type: TokenType.VERIFICATION,
            data: {
              id: targetUser.id,
            },
          }),
        },
      });
      break;

    case EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE:
      emitter.emitTransactionalEmail({
        type: EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE,
        receivers: [targetUser],
        data: {
          clientType,
          token: generateToken({
            type: TokenType.EMAIL_UPDATE_VERIFICATION,
            data: {
              existingEmail: 'dev@madebyprism.com',
              newEmail: 'dev+new@madebyprism.com',
            },
          }),
        },
      });
      break;

    case EMAIL_INTERNAL_TYPE.USER_REGISTERED:
      emitter.emitInternalEmail({
        type: EMAIL_INTERNAL_TYPE.USER_REGISTERED,
        data: {
          user: targetUser,
        },
      });
      break;

    default:
      break;
  }
})();
