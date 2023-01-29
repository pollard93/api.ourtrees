import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType,
  Int
} from 'type-graphql';
import { TreeData } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { GenericError } from '../../errors';


@InputType()
export class UpsertTreeDataCareGerminationNotesVoteInput {
  @Field()
  contentId: string
}


@Resolver()
export class UpsertTreeDataCareGerminationNotesVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
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
     * Get all content for the tree data with votes counted
     */
    const contents = await context.db.read.treeDataCareGerminationNotesContent.findMany({
      where: {
        treeDataId: content.treeDataId,
      },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    /**
     * Get top voted
     * @TODO - better way to get top if 2 contents have equal vote counts?
     */
    // eslint-disable-next-line no-underscore-dangle
    const topVotes = Math.max(...Object.values(contents).map((c) => c._count.votes));
    // eslint-disable-next-line no-underscore-dangle
    const topVoted = contents.find((c) => c._count.votes === topVotes);

    /**
     * Update tree data with counts
     */
    return context.db.write.treeData.update({
      where: {
        id: content.treeDataId,
      },
      data: {
        careGerminationNotesResult: {
          upsert: {
            create: {
              content: topVoted ? {
                connect: {
                  id: topVoted.id,
                },
              } : undefined,
            },
            update: {
              content: topVoted ? {
                connect: {
                  id: topVoted.id,
                },
              } : undefined,
            },
          },
        },
      },
    });
  }
}
