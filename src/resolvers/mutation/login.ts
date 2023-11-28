import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, InputType, Field } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { AuthPayload } from '../../types/AuthPayload';
import { GenericError } from '../../errors';
import { comparePassword, setGeneralTokens } from '../../modules/Auth';

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class LoginResolver {
  @Mutation(() => AuthPayload)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: null,
    }),
  )
  async login(
    @Arg('data') { email, password }: LoginInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ token: string; user: User }> {
    /**
     * Get user
     */
    const user = await context.db.read.user.findUnique({ where: { email } });
    if (!user) throw GenericError('Email or Password Incorrect');

    /**
     * Validate password
     */
    if (!(await comparePassword({ pwd: password, hash: user.password }))) {
      throw GenericError('Email or Password Incorrect');
    }

    return {
      token: await setGeneralTokens(context, user),
      user,
    };
  }
}
