import 'reflect-metadata';
import { Resolver,
  Mutation,
  Arg,
  Ctx,
  InputType,
  Field,
  UseMiddleware } from 'type-graphql';
import { User } from '@prisma/client';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TokenType } from '../../modules/Auth/interfaces';
import { EMAIL_TRANSACTIONAL_TYPE } from '../../events/email/types';
import { AuthPayload } from '../../types/AuthPayload';
import { validateEmail, validatePassword, hashPassword, setGeneralTokens, generateToken } from '../../modules/Auth';
import { GenericError } from '../../errors';
import { Context } from '../../utils/types';


@InputType()
export class RegisterInput {
  @Field()
  email: string

  @Field()
  password: string
}


@Resolver()
export class RegisterResolver {
  @Mutation(() => AuthPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: null,
  }))
  async register(
    @Arg('data') { email, password }: RegisterInput,
    @Ctx() context: Context<null>,
  ): Promise<{ token: string, user: User }> {
    /**
     * Validate data
     */
    if (!validateEmail(email)) throw GenericError('Email Invalid');
    if (!validatePassword(password)) throw GenericError('Password Invalid');


    try {
      const user = await context.db.write.user.create({
        data: {
          email,
          password: await hashPassword(password),
        },
      });


      /**
       * Emit email
       */
      context.emailEvents.emitTransactionalEmail({
        type: EMAIL_TRANSACTIONAL_TYPE.VERIFY_EMAIL,
        receivers: [user],
        data: {
          clientType: context.clientType,
          token: generateToken({
            type: TokenType.VERIFICATION,
            exp: Math.floor(Date.now() + 3.6e+6), // 1 hour
            data: {
              id: user.id,
            },
          }),
        },
      });


      return {
        token: await setGeneralTokens(context, user),
        user,
      };
    } catch (e) {
      throw e.message.includes('Unique constraint failed on the constraint')
        ? GenericError('User Already Exists')
        : e;
    }
  }
}
