import 'reflect-metadata';
import { Resolver, Mutation, Arg, Ctx, UseMiddleware, Field, InputType } from 'type-graphql';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TokenType } from '../../modules/Auth/interfaces';
import { EMAIL_TRANSACTIONAL_TYPE } from '../../events/email/types';
import { GenericError } from '../../errors';
import { Context } from '../../utils/types';
import { comparePassword, generateToken } from '../../modules/Auth';

@InputType()
export class UpdateEmailInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class UpdateEmailResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async updateEmail(
    @Arg('data') { email, password }: UpdateEmailInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    const { email: existingEmail } = context.accessToken.data;
    const user = await context.db.read.user.findUnique({ where: { email: existingEmail } });
    if (!user) throw GenericError('User does not exist');

    /**
     * Check theres no user in the database with the email
     * that is trying to be changed to
     */
    const emailInUse = await context.db.read.user.findUnique({ where: { email } });
    if (emailInUse) throw GenericError('Invalid Email');

    /**
     * Check the password is valid before going any further
     */
    const validPassword = await comparePassword({ pwd: password, hash: user.password });
    if (!validPassword) throw GenericError('Password Incorrect');

    /**
     * Send verification request to the new email for confirmation
     */
    context.emailEvents.emitTransactionalEmail({
      type: EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL_CHANGE,
      receivers: [{ id: user.id, email }],
      data: {
        clientType: context.clientType,
        token: generateToken({
          type: TokenType.EMAIL_UPDATE_VERIFICATION,
          exp: Math.floor(Date.now() + 3.6e6), // 1 hour,
          data: {
            newEmail: email,
            existingEmail,
          },
        }),
      },
    });

    return true;
  }
}
