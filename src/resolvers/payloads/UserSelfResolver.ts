import 'reflect-metadata';
import { User } from '@prisma/client';
import { Ctx, FieldResolver, Int, Resolver, Root } from 'type-graphql';
import { Context } from '../../utils/types';
import { requiresUpdate } from '../../utils/functions';
import { RequiresUpdate, UserSelf } from '../../types/UserSelf';
import { FileProfile } from '../../types/FileProfile';

@Resolver(() => UserSelf)
export class UserSelfResolver {
  @FieldResolver(() => FileProfile)
  profilePicture(@Root() { id }: User, @Ctx() context: Context<null>) {
    return context.db.read.user.findUnique({ where: { id } }).profilePicture();
  }

  @FieldResolver(() => Int)
  unreadNotificationCount(@Root() { id }: User, @Ctx() context: Context<null>) {
    return context.db.read.notification.count({
      where: {
        receiver: { id },
        readDate: null,
      },
    });
  }

  @FieldResolver(() => RequiresUpdate)
  requiresUpdate(@Ctx() context: Context<null>) {
    return requiresUpdate(context.clientVersion, process.env.MINIMUM_CLIENT_VERSION || '');
  }
}
