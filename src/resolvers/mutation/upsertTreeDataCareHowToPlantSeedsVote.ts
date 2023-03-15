import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TreeData } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { GenericError } from '../../errors';
import { setTopVotedTreeDataCareHowToPlantSeedsContent } from '../../utils/setTopVotedTreeDataCareHowToPlantSeedsContent';


@InputType()
export class UpsertTreeDataCareHowToPlantSeedsVoteInput {
  @Field()
  contentId: string
}


@Resolver()
export class UpsertTreeDataCareHowToPlantSeedsVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async upsertTreeDataCareHowToPlantSeedsVote(
    @Arg('data') { contentId }: UpsertTreeDataCareHowToPlantSeedsVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Get content
     */
    const content = await context.db.read.treeDataCareHowToPlantSeedsContent.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) throw GenericError('Resource does not exist');

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCareHowToPlantSeedsVote.upsert({
      where: {
        userId_treeDataId: {
          userId,
          treeDataId: content.treeDataId,
        },
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        treeData: {
          connect: {
            id: content.treeDataId,
          },
        },
        content: {
          connect: {
            id: contentId,
          },
        },
      },
      update: {
        user: {
          connect: {
            id: userId,
          },
        },
        treeData: {
          connect: {
            id: content.treeDataId,
          },
        },
        content: {
          connect: {
            id: contentId,
          },
        },
      },
    });


    /**
     * Update tree data with counts
     */
    return setTopVotedTreeDataCareHowToPlantSeedsContent(context, content.treeDataId);
  }
}
