import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { UserSelf } from '../../types/UserSelf';


@Resolver()
export class GetSelfResolver {
  @Query(() => UserSelf)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getSelf(
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<User | null> {
    const { email } = context.accessToken.data;
    return context.db.read.user.findUnique({ where: { email } });
  }
}
