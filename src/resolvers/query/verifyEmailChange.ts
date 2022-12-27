import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { AuthPayload } from '../../types/AuthPayload';
import { setGeneralTokens } from '../../modules/Auth';
import { GenericError } from '../../errors';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';


@Resolver()
export class VerifyEmailChangeResolver {
  @Query(() => AuthPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.EMAIL_UPDATE_VERIFICATION],
    refreshTokenNotRequired: true,
  }))
  async verifyEmailChange(
    @Ctx() context: Context<TokenType.EMAIL_UPDATE_VERIFICATION>,
  ): Promise<{ token: string, user: User }> {
    const { newEmail, existingEmail } = context.accessToken.data;


    /**
     * Check the user with the existing email still exists
     */
    const userExists = await context.db.read.user.findUnique({ where: { email: existingEmail } });
    if (!userExists) throw GenericError('Token Invalid');


    /**
     * Update the users email
     */
    const user = await context.db.write.user.update({
      where: { email: existingEmail },
      data: { email: newEmail },
    });


    return {
      token: await setGeneralTokens(context, user),
      user,
    };
  }
}
