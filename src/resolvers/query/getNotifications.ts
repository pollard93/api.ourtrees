import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Int,
  Field,
  ObjectType,
  InputType,
  Arg } from 'type-graphql';
import { Notification, Prisma } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { NotificationProfile } from '../../types/NotificationProfile';


export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}


@InputType()
class NotificationWhereUniqueInput {
  @Field()
  id: string
}


@InputType()
class NotificationOrderByInput {
  @Field()
  createdAt?: SortOrder | null

  @Field()
  id?: SortOrder | null

  @Field()
  message?: SortOrder | null

  @Field()
  onOpenType?: SortOrder | null

  @Field()
  readDate?: SortOrder | null

  @Field()
  receiverId?: SortOrder | null

  @Field()
  senderId?: SortOrder | null

  @Field()
  type?: SortOrder | null

  @Field()
  updatedAt?: SortOrder | null
}


@InputType()
export class GetNotificationsInput {
  @Field(() => NotificationWhereUniqueInput)
  cursor: NotificationWhereUniqueInput

  @Field()
  take: number

  @Field(() => [NotificationOrderByInput])
  orderBy: NotificationOrderByInput[]
}


@ObjectType()
export class NotificationProfilesPayLoad {
  @Field(() => [NotificationProfile])
  notifications: NotificationProfile[]

  @Field(() => Int)
  count: number
}


@Resolver()
export class GetNotificationsResolver {
  @Query(() => NotificationProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getNotifications(
    @Arg('data', { nullable: true }) data: GetNotificationsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ notifications: Notification[], count: number }> {
    const { email } = context.accessToken.data;


    /**
     * Always query users own notifications only
     */
    const where: Prisma.NotificationWhereInput = {
      receiver: {
        email,
      },
    };


    /**
     * Get notifications and return
     */
    const notifications = await context.db.read.user.findUnique({ where: { email } }).notificationsReceived({
      where,
      cursor: data?.cursor,
      take: data?.take,
      orderBy: data?.orderBy,
    });


    /**
     * Count
     */
    const count = await context.db.read.notification.count({
      where,
    });


    return {
      notifications,
      count,
    };
  }
}
