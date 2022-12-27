import 'reflect-metadata';
import { Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  InputType,
  Field } from 'type-graphql';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TokenType } from '../../modules/Auth/interfaces';
import { EMAIL_TRANSACTIONAL_TYPE } from '../../events/email/types';
import { GenericError } from '../../errors';
import { Context } from '../../utils/types';
import { generateToken } from '../../modules/Auth';


@InputType()
export class RequestPasswordResetInput {
  @Field()
  email: string
}


@Resolver()
export class RequestPasswordResetResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: null,
  }))
  async requestPasswordReset(
    @Arg('data') { email }: RequestPasswordResetInput,
    @Ctx() context: Context,
  ): Promise<boolean> {
    /**
     * Get user from collective db
     */
    const user = await context.db.read.user.findUnique({ where: { email } });
    if (!user) throw GenericError('User Does Not Exist');


    /**
     * Emit email
     */
    context.emailEvents.emitTransactionalEmail({
      type: EMAIL_TRANSACTIONAL_TYPE.PASSWORD_RESET_TOKEN,
      receivers: [user],
      data: {
        clientType: context.clientType,
        token: generateToken({
          type: TokenType.RESET,
          data: {
            email,
          },
        }),
      },
    });


    return true;
  }
}
