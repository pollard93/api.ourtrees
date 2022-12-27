import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { AuthPayload } from '../../types/AuthPayload';
import { setGeneralTokens } from '../../modules/Auth';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';


@Resolver()
export class VerifyUserResolver {
  @Query(() => AuthPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.VERIFICATION],
  }))
  async verifyUser(
    @Ctx() context: Context<TokenType.VERIFICATION>,
  ): Promise<{ token: string, user: User }> {
    const { id } = context.accessToken.data;


    /**
     * Update user
     */
    const user = await context.db.write.user.update({
      data: { verified: true },
      where: { id },
    });


    return {
      token: await setGeneralTokens(context, user),
      user,
    };
  }
}
