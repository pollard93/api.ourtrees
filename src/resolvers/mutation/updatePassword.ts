import 'reflect-metadata';
import { Resolver,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  Field,
  InputType } from 'type-graphql';
import { GenericError } from '../../errors';
import { validatePassword, comparePassword, hashPassword } from '../../modules/Auth';
import { TokenType } from '../../modules/Auth/interfaces';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { Context } from '../../utils/types';


@InputType()
export class UpdatePasswordInput {
  @Field()
  currentPassword: string

  @Field()
  newPassword: string
}


@Resolver()
export class UpdatePasswordResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async updatePassword(
    @Arg('data') { newPassword, currentPassword }: UpdatePasswordInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    /**
     * Get user
     */
    const { id } = context.accessToken.data;
    const user = await context.db.read.user.findUnique({ where: { id } });
    if (!user) throw GenericError('User does not exist');


    /**
    * Validate new password
    */
    if (!validatePassword(newPassword)) throw GenericError('Invalid new password');


    /**
    * Validate current password
    */
    if (!await comparePassword({ pwd: currentPassword, hash: user.password })) throw GenericError('Password Incorrect');


    /**
    * Update user
    */
    await context.db.write.user.update({
      where: { id },
      data: {
        password: await hashPassword(newPassword),
      },
    });


    return true;
  }
}
