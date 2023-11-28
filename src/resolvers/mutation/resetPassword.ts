import 'reflect-metadata';
import { Resolver, Mutation, Arg, Ctx, UseMiddleware, InputType, Field } from 'type-graphql';
import { User } from '@prisma/client';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TokenType } from '../../modules/Auth/interfaces';
import { EMAIL_TRANSACTIONAL_TYPE } from '../../events/email/types';
import { GenericError } from '../../errors';
import { Context } from '../../utils/types';
import { hashPassword, setGeneralTokens, validatePassword } from '../../modules/Auth';
import { AuthPayload } from '../../types/AuthPayload';

@InputType()
export class ResetPasswordInput {
  @Field()
  password: string;
}

@Resolver()
export class ResetPasswordResolver {
  @Mutation(() => AuthPayload)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.RESET],
      refreshTokenNotRequired: true,
    }),
  )
  async resetPassword(
    @Arg('data') { password }: ResetPasswordInput,
    @Ctx() context: Context<TokenType.RESET>,
  ): Promise<{ token: string; user: User }> {
    if (!validatePassword(password)) throw GenericError('Password Invalid');
    const { email } = context.accessToken.data;

    /**
     * Update user
     */
    const user = await context.db.write.user.update({
      data: { password: await hashPassword(password) },
      where: { email },
    });

    /**
     * Emit email
     */
    context.emailEvents.emitTransactionalEmail({
      type: EMAIL_TRANSACTIONAL_TYPE.PASSWORD_CHANGED,
      receivers: [user],
    });

    return {
      token: await setGeneralTokens(context, user),
      user,
    };
  }
}
