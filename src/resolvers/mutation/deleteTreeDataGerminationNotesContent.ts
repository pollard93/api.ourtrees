import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType
} from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';


@InputType()
export class DeleteTreeDataCareGerminationNotesContentInput {
  @Field()
  id: string
}


@Resolver()
export class DeleteTreeDataCareGerminationNotesContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async deleteTreeDataCareGerminationNotesContent(
    @Arg('data') { id }: DeleteTreeDataCareGerminationNotesContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    const { id: userId } = context.accessToken.data;

    /**
     * Only owner can delete
     */
    const data = await context.db.read.treeDataCareGerminationNotesContent.findUnique({
      where: {
        id,
      },
    });
    if (!data) throw GenericError('Resource does not exist');
    if (data.userId !== userId) throw GenericError('Unauthorized');

    /**
     * Delete
     */
    await context.db.write.treeDataCareGerminationNotesContent.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
