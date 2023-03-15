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
import { setTopVotedTreeDataCareHowToPlantSeedsContent } from '../../utils/setTopVotedTreeDataCareHowToPlantSeedsContent';


@InputType()
export class ReportTreeDataCareHowToPlantSeedsContentInput {
  @Field()
  id: string
}


@Resolver()
export class ReportTreeDataCareHowToPlantSeedsContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async reportTreeDataCareHowToPlantSeedsContent(
    @Arg('data') { id }: ReportTreeDataCareHowToPlantSeedsContentInput,
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
    await setTopVotedTreeDataCareHowToPlantSeedsContent(context, content.treeDataId);


    return true;
  }
}
