import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { UserProfile } from '../../types/UserProfile';

@InputType()
export class FollowUserInput {
  @Field()
  userId: string;

  @Field({ nullable: true })
  unfollow?: boolean;
}

@Resolver()
export class FollowUserResolver {
  @Mutation(() => UserProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async followUser(
    @Arg('data') { userId, unfollow }: FollowUserInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<User> {
    const { id: requestorId } = context.accessToken.data;
    return context.db.write.user.update({
      where: {
        id: userId,
      },
      data: {
        followers: {
          [unfollow ? 'disconnect' : 'connect']: {
            id: requestorId,
          },
        },
      },
    });
  }
}
