import { Notification, User } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { NotificationProfile } from '../../types/NotificationProfile';
import { UserProfile } from '../../types/UserProfile';
import { Context } from '../../utils/types';


@Resolver(() => NotificationProfile)
export class NotificationProfileResolver {
  @FieldResolver(() => UserProfile)
  receiver(@Root() { receiverId }: Notification, @Ctx() context: Context): Promise<User> {
    return context.db.read.user.findUnique({ where: { id: receiverId } });
  }

  @FieldResolver(() => UserProfile)
  sender(@Root() { senderId }: Notification, @Ctx() context: Context): Promise<User> {
    return context.db.read.user.findUnique({ where: { id: senderId } });
  }
}
