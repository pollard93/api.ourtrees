import 'reflect-metadata';
import { User } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { UserProfile } from '../../types/UserProfile';
import { FileProfile } from '../../types/FileProfile';

@Resolver(() => UserProfile)
export class UserProfileResolver {
  @FieldResolver(() => FileProfile)
  profilePicture(@Root() { id }: User, @Ctx() context: Context<null>) {
    return context.db.read.user.findUnique({ where: { id } }).profilePicture();
  }

  @FieldResolver(() => Boolean)
  async following(@Root() { id }: User, @Ctx() context: Context<TokenType.GENERAL>) {
    const { email } = context.accessToken.data;
    const hasFollower = await context.db.read.user
      .findUnique({ where: { email } })
      .following({ where: { id } });
    return hasFollower && hasFollower.length === 1;
  }
}
