import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';


@InputType()
export class DeleteNotificationInput {
  @Field()
  id: string
}


@Resolver()
export class DeleteNotificationResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async deleteNotification(
    @Arg('data') { id }: DeleteNotificationInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
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
     * Delete
     */
    await context.db.write.notification.delete({
      where: {
        id,
      },
    });


    return true;
  }
}
