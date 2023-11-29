/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
/* eslint-disable no-void */
/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { NOTIFICATION_TYPE, PrismaClient } from '@prisma/client';
import { reduceArgs } from './utils';
import NotificationEmitter from '../src/events/notification/NotificationEmitter';
import NotificationListener from '../src/events/notification/NotificationListener';
import { InitFileHandler } from '../src/modules/FileHandler';

dotenv.config();
InitFileHandler();

/**
 * Utility to send individual notifications and push notification to a device with actual data
 */
// eslint-disable-next-line wrap-iife
void (async function () {
  const prisma = new PrismaClient();

  /**
   * Set emitter and listener
   */
  const emitter = new NotificationEmitter();
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const listener = new NotificationListener(prisma, emitter);

  /**
   * Get target user
   */
  const targetUser = await prisma.user.findUnique({ where: { email: 'dev@madebyprism.com' } });
  if (!targetUser) {
    console.error(chalk.red('No user'));
    process.exit(0);
  }

  /**
   * Get and validate args
   */
  const { type } = reduceArgs<{ type: NOTIFICATION_TYPE }>();
  if (!type) {
    console.error(chalk.red("Please supply argument: 'type'"));
    process.exit(0);
  }

  /**
   * Emit notification based on type
   * Creates requires data
   */
  switch (type) {
    case 'PASSWORD_CHANGED':
      emitter.emitNotification({
        type: 'PASSWORD_CHANGED',
        receivers: [targetUser],
        data: {
          someData: 'required data here',
        },
      });
      break;

    default:
      break;
  }
})();
