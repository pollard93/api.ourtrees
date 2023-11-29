import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TreeData } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { GenericError } from '../../errors';
import { setTopVotedTreeDataCareGerminationNotesContent } from '../../utils/setTopVotedTreeDataCareGerminationNotesContent';

@InputType()
export class UpsertTreeDataCareGerminationNotesVoteInput {
  @Field()
  contentId: string;
}

@Resolver()
export class UpsertTreeDataCareGerminationNotesVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async upsertTreeDataCareGerminationNotesVote(
    @Arg('data') { contentId }: UpsertTreeDataCareGerminationNotesVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Get content
     */
    const content = await context.db.read.treeDataCareGerminationNotesContent.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) throw GenericError('Resource does not exist');

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCareGerminationNotesVote.upsert({
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
    return setTopVotedTreeDataCareGerminationNotesContent(context, content.treeDataId);
  }
}
