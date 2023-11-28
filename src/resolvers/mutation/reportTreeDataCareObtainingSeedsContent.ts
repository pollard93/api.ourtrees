import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';
import { setTopVotedTreeDataCareObtainingSeedsContent } from '../../utils/setTopVotedTreeDataCareObtainingSeedsContent';

@InputType()
export class ReportTreeDataCareObtainingSeedsContentInput {
  @Field()
  id: string;
}

@Resolver()
export class ReportTreeDataCareObtainingSeedsContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async reportTreeDataCareObtainingSeedsContent(
    @Arg('data') { id }: ReportTreeDataCareObtainingSeedsContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    /**
     * Get content
     */
    const content = await context.db.read.treeDataCareObtainingSeedsContent.findUnique({
      where: {
        id,
      },
    });
    if (!content) throw GenericError('Resource does not exist');

    /**
     * Report content
     */
    await context.db.write.treeDataCareObtainingSeedsContent.update({
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
    await setTopVotedTreeDataCareObtainingSeedsContent(context, content.treeDataId);

    return true;
  }
}
