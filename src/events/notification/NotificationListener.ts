import { Notification } from 'onesignal-node';
import { Prisma as PrismaInterface } from 'prisma';
import { Prisma, NOTIFICATION_TYPE, NOTIFICATION_ON_OPEN_TYPE } from '@prisma/client';
import NotificationEmitter from './NotificationEmitter';
import { OneSignalClient } from '../../modules/OneSignal';
import { NotificationEventType, DBNotificationArgs, PushNotificationArgs, NotificationArgs } from './types';

export default class NotificationListener {
  private oneSignal = OneSignalClient();

  constructor(private readonly prisma: PrismaInterface, private readonly userEmitter: NotificationEmitter, disableInitialBind = false) {
    /**
     * For testing we need to bind after assigning spies/stubs to class methods
     */
    if (!disableInitialBind) {
      this.bindListeners();
    }
  }

  bindListeners() {
    this.userEmitter.addListener(NotificationEventType.DATABASE, this.handleDB.bind(this));
    this.userEmitter.addListener(NotificationEventType.PUSH, this.handlePush.bind(this));
    this.userEmitter.addListener(NotificationEventType.SEND, this.handleSend.bind(this));
  }


  /**
   * Creates a Notficiation in the database
   */
  async handleDB(data: DBNotificationArgs<NOTIFICATION_TYPE>) {
    /**
     * Define default data
     */
    const notificationData: Prisma.NotificationCreateInput = {
      type: data.type,
      receiver: { connect: { id: data.receiver.id } },
      message: data.message,
      onOpenType: data.onOpenType,
      sender: data.sender ? { connect: { id: data.sender.id } } : {},
    };


    /**
     * Connect optional data dependant on NOTIFICATION_TYPE
     */
    switch (data.type) {
      default:
        break;
    }


    /**
     * Create and return
     * (seems to break unit test if returned directly)
     */
    const notification = await this.prisma.write.notification.create({ data: notificationData });
    return notification;
  }


  /**
   * Uses OneSignal to send a push a notification
   */
  async handlePush<T extends NOTIFICATION_TYPE>(data: PushNotificationArgs<T>) {
    try {
      const margeDefaultData: PushNotificationArgs<T> = {
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
        ...data,
      };

      await this.oneSignal.sendNotification(new Notification(margeDefaultData));
      // eslint-disable-next-line no-empty
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('NotificationListener -> handlePush', e);
    }
  }


  /**
   * Puts the notification in the database and sends a push notification if applicable
   */
  async handleSend(args: NotificationArgs<NOTIFICATION_TYPE>) {
    for (const receiver of args.receivers) {
      try {
        switch (args.type) {
          case 'PASSWORD_CHANGED': {
            const { id: notificationId } = await this.handleDB({
              ...args,
              message: 'Your password has changed',
              onOpenType: 'SOME_TYPE_TO_OPEN',
              receiver,
            });

            if (!args.disablePush) {
              await this.handlePush({
                headings: {
                  en: 'Security Update',
                },
                contents: {
                  en: 'Your password has been changed',
                },
                data: {
                  type: 'PASSWORD_CHANGED',
                  notificationId,
                  onOpenType: NOTIFICATION_ON_OPEN_TYPE.SOME_TYPE_TO_OPEN,
                  someData: 'some required data here',
                },
                include_external_user_ids: [receiver.id],
              });
            }
            break;
          }

          default:
            break;
        }
        // eslint-disable-next-line no-empty
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('NotificationListener -> handleSend', e);
      }
    }
  }
}
