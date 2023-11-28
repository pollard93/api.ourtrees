import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';

@InputType()
export class DeleteTreeDataCareObtainingSeedsContentInput {
  @Field()
  id: string;
}

@Resolver()
export class DeleteTreeDataCareObtainingSeedsContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async deleteTreeDataCareObtainingSeedsContent(
    @Arg('data') { id }: DeleteTreeDataCareObtainingSeedsContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    const { id: userId } = context.accessToken.data;

    /**
     * Only owner can delete
     */
    const data = await context.db.read.treeDataCareObtainingSeedsContent.findUnique({
      where: {
        id,
      },
    });
    if (!data) throw GenericError('Resource does not exist');
    if (data.userId !== userId) throw GenericError('Unauthorized');

    /**
     * Delete
     */
    await context.db.write.treeDataCareObtainingSeedsContent.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
