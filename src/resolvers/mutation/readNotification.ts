import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  InputType,
  Field } from 'type-graphql';
import { Notification } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { NotificationProfile } from '../../types/NotificationProfile';


@InputType()
export class ReadNotificationInput {
  @Field()
  id: string

  @Field({ nullable: true })
  unRead?: boolean
}


@Resolver()
export class ReadNotificationResolver {
  @Mutation(() => NotificationProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async readNotification(
    @Arg('data') { id, unRead }: ReadNotificationInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Notification> {
    const { id: userId } = context.accessToken.data;


    /**
     * Get and validate the requester owns the notification
     */
    const notification = await context.db.read.notification.findUnique({
      where: {
        id,
      },
    });
    if (!notification || notification.receiverId !== userId) throw new Error();


    /**
     * Update and return
     */
    return context.db.write.notification.update({
      where: { id },
      data: {
        readDate: unRead ? null : new Date(),
      },
    });
  }
}
