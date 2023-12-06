import 'reflect-metadata';
import { Resolver, Ctx, Query, UseMiddleware, Field, InputType, Arg, ID } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { UserProfile } from '../../types/UserProfile';
import { GenericError } from '../../errors';

@InputType()
export class GetUserInput {
  @Field(() => ID)
  id: string;
}

@Resolver()
export class GetUserResolver {
  @Query(() => UserProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getUser(
    @Arg('data') data: GetUserInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<User> {
    const user = await context.db.read.user.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!user) throw GenericError('User does not exist');
    return user;
  }
}
