import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';
import { setTopVotedTreeDataCareGerminationNotesContent } from '../../utils/setTopVotedTreeDataCareGerminationNotesContent';


@InputType()
export class ReportTreeDataCareGerminationNotesContentInput {
  @Field()
  id: string
}


@Resolver()
export class ReportTreeDataCareGerminationNotesContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async reportTreeDataCareGerminationNotesContent(
    @Arg('data') { id }: ReportTreeDataCareGerminationNotesContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    /**
     * Get content
     */
    const content = await context.db.read.treeDataCareGerminationNotesContent.findUnique({
      where: {
        id,
      },
    });
    if (!content) throw GenericError('Resource does not exist');


    /**
     * Report content
     */
    await context.db.write.treeDataCareGerminationNotesContent.update({
      where: {
        id,
      },
      data: {
        reportedAt: new Date(),
      },
    });


    /**
     * Update top voted content
     */
    await setTopVotedTreeDataCareGerminationNotesContent(context, content.treeDataId);


    return true;
  }
}
